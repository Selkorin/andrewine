import asyncio

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.core.config import get_settings
from app.db.session import get_session
from app.models.application import ApplicationStatus
from app.repositories.applications import ApplicationRepository
from app.schemas.application import ApplicationBase, ApplicationList, ApplicationMessageRead, ApplicationRead, ApplicationUpdate, DashboardStats
from app.services.image_service import UploadValidationError, save_upload
from app.services.notification_service import notify_user_manager_comment, notify_user_status
from app.tasks.worker import notify_managers_for_application, process_application_images
from app.utils.telegram import TelegramAuthError, validate_init_data

router = APIRouter(prefix="/applications", tags=["applications"])


async def application_to_read(repo: ApplicationRepository, app) -> ApplicationRead:
    data = ApplicationRead.model_validate(app)
    messages = await repo.list_messages(app)
    if messages:
        data.messages = [ApplicationMessageRead.model_validate(message) for message in messages]
        return data

    fallback_messages = []
    if app.comment and app.comment.strip():
        fallback_messages.append(
            ApplicationMessageRead(id=0, sender="client", text=app.comment.strip(), created_at=app.created_at)
        )
    if app.manager_comment and app.manager_comment.strip():
        fallback_messages.append(
            ApplicationMessageRead(id=0, sender="manager", text=app.manager_comment.strip(), created_at=app.updated_at)
        )
    data.messages = fallback_messages
    return data


@router.post("", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(
    initData: str = Form(...),
    category: str = Form(...),
    title: str = Form(...),
    brand: str | None = Form(None),
    volume: str | None = Form(None),
    year: str | None = Form(None),
    serial_number: str | None = Form(None),
    package: str | None = Form(None),
    condition: str | None = Form(None),
    fill_level: str | None = Form(None),
    comment: str | None = Form(None),
    contact: str = Form(...),
    main_photo: UploadFile = File(...),
    extra_photos: list[UploadFile] | None = File(None),
    session: AsyncSession = Depends(get_session),
) -> ApplicationRead:
    settings = get_settings()
    try:
        tg = validate_init_data(initData, settings.bot_token)
    except TelegramAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    data = ApplicationBase(
        category=category.strip(),
        title=title.strip(),
        brand=brand.strip() if brand else None,
        volume=volume,
        year=year,
        serial_number=serial_number,
        package=package,
        condition=condition,
        fill_level=fill_level,
        comment=comment,
        contact=contact.strip(),
    )
    try:
        saved_paths = await asyncio.gather(
            save_upload(main_photo),
            *(save_upload(file) for file in extra_photos or []),
        )
        main_photo_path = saved_paths[0]
        extra_paths = list(saved_paths[1:])
    except UploadValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    user = tg["user"]
    app = await ApplicationRepository(session).create(
        data,
        user_id=int(user["id"]),
        username=user.get("username"),
        main_photo=main_photo_path,
        extra_photos=extra_paths,
    )
    try:
        process_application_images.delay(app.uuid)
    except Exception:
        process_application_images(app.uuid)
    try:
        notify_managers_for_application.delay(app.uuid)
    except Exception as exc:
        logger.exception("Failed to enqueue manager notification for application {}: {}", app.uuid, exc)
    return await application_to_read(ApplicationRepository(session), app)


@router.post("/web", response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_web_application(
    request: Request,
    category: str = Form("Алкоголь"),
    name: str | None = Form(None),
    email: str | None = Form(None),
    phone: str = Form(...),
    message: str | None = Form(None),
    source: str | None = Form(None),
    website: str | None = Form(None),
    photos: list[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session),
) -> ApplicationRead:
    """Accept a lead from the public website without Telegram initData."""
    if website:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Spam check failed")

    phone = phone.strip()
    digits = "".join(char for char in phone if char.isdigit())
    if len(digits) < 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Укажите корректный телефон")
    if not photos or len(photos) > 10:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Добавьте от 1 до 10 фотографий")

    clean_name = (name or "").strip()[:120]
    clean_email = (email or "").strip()[:160]
    clean_category = category.strip()[:64] or "Алкоголь"
    clean_source = (source or str(request.headers.get("referer") or "Сайт"))[:500]
    comment_parts = [
        f"Имя: {clean_name or 'не указано'}",
        f"Email: {clean_email or 'не указан'}",
        f"Источник: {clean_source}",
    ]
    if message and message.strip():
        comment_parts.append(f"Сообщение: {message.strip()[:1000]}")

    try:
        saved_paths = await asyncio.gather(*(save_upload(photo) for photo in photos))
    except UploadValidationError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc

    data = ApplicationBase(
        category=clean_category,
        title=f"Заявка с сайта — {clean_category}"[:255],
        comment="\n".join(comment_parts),
        contact=" · ".join(value for value in [clean_name, phone, clean_email] if value)[:255],
    )
    app = await ApplicationRepository(session).create(
        data,
        user_id=0,
        username=None,
        main_photo=saved_paths[0],
        extra_photos=list(saved_paths[1:]),
    )
    try:
        process_application_images.delay(app.uuid)
    except Exception:
        process_application_images(app.uuid)
    try:
        notify_managers_for_application.delay(app.uuid)
    except Exception as exc:
        logger.exception("Failed to enqueue manager notification for web application {}: {}", app.uuid, exc)
    return await application_to_read(ApplicationRepository(session), app)


@router.get("", response_model=ApplicationList, dependencies=[Depends(get_current_admin)])
async def list_applications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    status_filter: ApplicationStatus | None = Query(None, alias="status"),
    sort: str = Query("created_desc"),
    session: AsyncSession = Depends(get_session),
) -> ApplicationList:
    items, total = await ApplicationRepository(session).list(page, page_size, search, status_filter, sort)
    return ApplicationList(items=[ApplicationRead.model_validate(item) for item in items], total=total, page=page, page_size=page_size)


@router.get("/stats", response_model=DashboardStats, dependencies=[Depends(get_current_admin)])
async def stats(session: AsyncSession = Depends(get_session)) -> DashboardStats:
    return DashboardStats(**await ApplicationRepository(session).stats())


@router.get("/my", response_model=ApplicationList)
async def my_applications(
    initData: str = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
) -> ApplicationList:
    settings = get_settings()
    try:
        tg = validate_init_data(initData, settings.bot_token)
    except TelegramAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    user_id = int(tg["user"]["id"])
    items, total = await ApplicationRepository(session).list_by_user(user_id, page, page_size)
    return ApplicationList(items=[ApplicationRead.model_validate(item) for item in items], total=total, page=page, page_size=page_size)


@router.get("/my/{uuid}", response_model=ApplicationRead)
async def my_application_detail(
    uuid: str,
    initData: str = Query(...),
    session: AsyncSession = Depends(get_session),
) -> ApplicationRead:
    settings = get_settings()
    try:
        tg = validate_init_data(initData, settings.bot_token)
    except TelegramAuthError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    repo = ApplicationRepository(session)
    app = await repo.get_by_uuid_for_user(uuid, int(tg["user"]["id"]))
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return await application_to_read(repo, app)


@router.get("/{uuid}", response_model=ApplicationRead, dependencies=[Depends(get_current_admin)])
async def get_application(uuid: str, session: AsyncSession = Depends(get_session)) -> ApplicationRead:
    app = await ApplicationRepository(session).get_by_uuid(uuid)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return await application_to_read(ApplicationRepository(session), app)


@router.patch("/{uuid}", response_model=ApplicationRead, dependencies=[Depends(get_current_admin)])
async def update_application(uuid: str, payload: ApplicationUpdate, session: AsyncSession = Depends(get_session)) -> ApplicationRead:
    repo = ApplicationRepository(session)
    app = await repo.get_by_uuid(uuid)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    previous = app.status
    previous_comment = app.manager_comment or ""
    updated = await repo.update(app, payload.status, payload.manager_comment)
    if updated.user_id > 0 and payload.status and payload.status != previous:
        await notify_user_status(updated.user_id, payload.status)
    comment = (payload.manager_comment or "").strip()
    if updated.user_id > 0 and comment and (payload.notify_user or comment != previous_comment.strip()):
        await repo.add_message(updated, "manager", comment)
        await notify_user_manager_comment(updated.user_id, updated.public_id or updated.uuid[:5].upper(), comment)
    return await application_to_read(repo, updated)
