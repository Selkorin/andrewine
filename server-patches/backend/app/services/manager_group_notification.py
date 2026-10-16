import html
import json
import os
from contextlib import ExitStack
from pathlib import Path

import httpx
from loguru import logger

from app.core.config import get_settings


def _value(value) -> str:
    return html.escape(str(value)) if value not in (None, "") else "—"


def _photo_sources(application) -> list[str]:
    return [str(source) for source in [application.main_photo, *(application.extra_photos or [])] if source][:10]


def _local_photo(source: str) -> Path | None:
    """Resolve both absolute storage paths and paths relative to UPLOAD_ROOT."""
    candidates = [Path(source)]
    upload_root = os.getenv("UPLOAD_ROOT")
    if upload_root:
        candidates.append(Path(upload_root) / source.lstrip("/"))
    return next((candidate for candidate in candidates if candidate.is_file()), None)


def _message(application) -> str:
    application_number = application.public_id or application.uuid[:5].upper()
    admin_panel_url = os.getenv("ADMIN_PANEL_URL", "").rstrip("/")
    detail_url = f"{admin_panel_url}/applications/{application.uuid}" if admin_panel_url else ""
    source = "Сайт andrewine.ru" if application.user_id == 0 else (
        f"@{application.username}" if application.username else f"Telegram ID {application.user_id}"
    )
    fields = [
        ("Название", application.title),
        ("Категория", application.category),
        ("Бренд", application.brand),
        ("Объём", application.volume),
        ("Год", application.year),
        ("Серийный номер", application.serial_number),
        ("Коробка", application.package),
        ("Состояние", application.condition),
        ("Наполнение", application.fill_level),
        ("Контакт", application.contact),
        ("Источник", source),
        ("Комментарий", application.comment),
    ]
    lines = [f"<b>Новая заявка №{_value(application_number)}</b>"]
    lines.extend(f"<b>{label}:</b> {_value(value)}" for label, value in fields)
    if detail_url:
        lines.extend(["", f'<a href="{html.escape(detail_url, quote=True)}">Открыть заявку в админке</a>'])
    return "\n".join(lines)


async def _send_photos(client: httpx.AsyncClient, api_url: str, chat_id: str, message_id: int, sources: list[str]) -> None:
    if not sources:
        return

    with ExitStack() as stack:
        files: dict[str, tuple[str, object, str]] = {}
        media = []
        for index, source in enumerate(sources):
            local_path = _local_photo(source)
            if local_path:
                field_name = f"photo{index}"
                handle = stack.enter_context(local_path.open("rb"))
                files[field_name] = (local_path.name, handle, "application/octet-stream")
                media.append({"type": "photo", "media": f"attach://{field_name}"})
            elif source.startswith(("http://", "https://")):
                media.append({"type": "photo", "media": source})
            else:
                logger.warning("Application photo was not found: {}", source)

        if not media:
            return

        reply_parameters = json.dumps({"message_id": message_id})
        if len(media) == 1:
            photo = media[0]["media"]
            data = {"chat_id": chat_id, "reply_parameters": reply_parameters}
            if photo.startswith("attach://"):
                field_name = photo.removeprefix("attach://")
                response = await client.post(
                    f"{api_url}/sendPhoto",
                    data={**data, "photo": photo},
                    files={field_name: files[field_name]},
                )
            else:
                response = await client.post(f"{api_url}/sendPhoto", json={**data, "photo": photo})
        else:
            response = await client.post(
                f"{api_url}/sendMediaGroup",
                data={
                    "chat_id": chat_id,
                    "media": json.dumps(media),
                    "reply_parameters": reply_parameters,
                },
                files=files or None,
            )
        response.raise_for_status()


async def notify_manager_group(application) -> None:
    """Post all application fields and its photos to the managers' group."""
    settings = get_settings()
    chat_id = os.getenv("MANAGER_GROUP_CHAT_ID")
    if not chat_id:
        return

    api_url = f"https://api.telegram.org/bot{settings.bot_token}"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{api_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": _message(application),
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
            response.raise_for_status()
            message_id = response.json()["result"]["message_id"]
            await _send_photos(client, api_url, chat_id, message_id, _photo_sources(application))
    except (httpx.HTTPError, KeyError, TypeError, ValueError):
        # Notification failure must never lose the application itself.
        logger.exception("Failed to notify manager group for application {}", application.uuid)
