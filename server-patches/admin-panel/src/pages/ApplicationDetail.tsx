import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Application, Status } from '../types/application';
import { statusLabels } from '../utils/status';

function formatMoscowDate(value: string) {
  const source = value.endsWith('Z') ? value : `${value}Z`;
  return `${new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(source))} МСК`;
}

export function ApplicationDetail() {
  const { uuid } = useParams();
  const [item, setItem] = useState<Application>();
  const [status, setStatus] = useState<Status>('new');
  const [comment, setComment] = useState('');
  const [notice, setNotice] = useState('');
  const [zoom, setZoom] = useState<string>();

  useEffect(() => {
    api.get(`/applications/${uuid}`).then((res) => {
      setItem(res.data);
      setStatus(res.data.status);
      setComment(res.data.manager_comment || '');
    });
  }, [uuid]);

  async function save(nextStatus = status, notifyUser = false) {
    const { data } = await api.patch(`/applications/${uuid}`, { status: nextStatus, manager_comment: comment, notify_user: notifyUser });
    setItem(data);
    setStatus(data.status);
    setNotice(notifyUser ? 'Ответ отправлен пользователю в Telegram' : 'Изменения сохранены');
  }

  async function sendReply() {
    if (!comment.trim()) {
      setNotice('Напишите ответ менеджера перед отправкой');
      return;
    }
    await save(status, true);
  }

  if (!item) return <section className="page"><div className="skeleton" /></section>;
  const photos = [item.main_photo, ...item.extra_photos].filter(Boolean);
  const isWebsiteLead = item.user_id === 0;
  const applicationNumber = item.public_id || item.uuid.slice(0, 5).toUpperCase();
  const messages = item.messages?.length
    ? item.messages
    : [
        ...(item.comment ? [{ id: 0, sender: 'client', text: item.comment, created_at: item.created_at }] : []),
        ...(item.manager_comment ? [{ id: 0, sender: 'manager', text: item.manager_comment, created_at: item.updated_at }] : [])
      ];

  return (
    <section className="page detail">
      <div className="page-title"><h1>{item.title}</h1><p>Заявка №{applicationNumber} • {item.category} • {formatMoscowDate(item.created_at)}</p></div>
      <div className="detail-grid">
        <article className="card fields">
          {Object.entries({
            Бренд: item.brand, Объем: item.volume, Год: item.year, 'Серийный номер': item.serial_number,
            Коробка: item.package, Состояние: item.condition, Наполнение: item.fill_level, Контакт: item.contact,
            Источник: isWebsiteLead ? 'Сайт andrewine.ru' : (item.username ? `@${item.username}` : item.user_id), Комментарий: item.comment
          }).map(([key, value]) => <p key={key}><span>{key}</span><strong>{value || '-'}</strong></p>)}
        </article>
        <article className="card actions">
          <label>Статус<select value={status} onChange={(e) => setStatus(e.target.value as Status)}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <button onClick={() => save()}>Сохранить</button>
        </article>
        <article className="card conversation">
          <div className="conversation-title">
            <h2>Диалог с клиентом</h2>
            <span>{isWebsiteLead ? 'Заявка с сайта' : (item.username ? `@${item.username}` : item.user_id)}</span>
          </div>
          <div className="chat-thread">
            {messages.length ? messages.map((message, index) => (
              <div className={`chat-bubble ${message.sender === 'manager' ? 'manager' : 'client'}`} key={`${message.id}-${index}`}>
                <small>{message.sender === 'manager' ? 'Менеджер' : 'Клиент'} · {formatMoscowDate(message.created_at)}</small>
                <p>{message.text}</p>
              </div>
            )) : (
              <div className="chat-bubble client">
                <small>Клиент</small>
                <p>Сообщений пока нет.</p>
              </div>
            )}
          </div>
          <label>{isWebsiteLead ? 'Комментарий менеджера' : 'Ответ менеджера клиенту'}<textarea rows={6} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Например: предварительно можем рассмотреть в диапазоне ... Менеджер уточнит детали по фото." /></label>
          {!isWebsiteLead && <button className="reply-button" onClick={sendReply}>Отправить в Telegram</button>}
          {isWebsiteLead && <p className="notice">Ответьте клиенту по телефону или email из поля «Контакт».</p>}
          {notice && <p className="notice">{notice}</p>}
        </article>
      </div>
      <div className="photo-grid">
        {photos.map((src) => (
          <article className="photo" key={src}>
            <button onClick={() => setZoom(src)}><img src={src} alt="Фото бутылки" loading="lazy" /></button>
            <a href={src} download title="Скачать"><Download size={18} /></a>
          </article>
        ))}
      </div>
      {zoom && <div className="lightbox" onClick={() => setZoom(undefined)}><img src={zoom} alt="Увеличенное фото" /></div>}
    </section>
  );
}
