<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> **ВАЖНО: Начни с чтения `HANDOFF.md`** — там полный контекст проекта: история, состояние, план, ключевые файлы, нюансы. Это продолжение предыдущей сессии.

## Дорожная карта

- **CRM для заявок (future):** приём заявок из Telegram, Instagram, Viber, WhatsApp — заявки приходят на свой сервер, ответ через админку. Единая лента обращений, история переписки, назначение ответственного.
- **Финансовый учёт:** приход/расход по каждой услуге, расчёт налогов и прибыли, интеграция с историей авто (RentCarHistory).
- **Почта:** SMTP/IMAP реализованы, пароли хранятся в БД в зашифрованном виде (AES-256-GCM, ключ `ENCRYPTION_KEY` в `.env`). Сейчас настроен тестовый Gmail. Нужно: создать ящик `info@avtoway.by` в cPanel, получить пароль, вбить в `/admin/email` → Настройки (`mail.avtoway.by` для SMTP и IMAP), проверить отправку и получение. В будущем — цепочки писем, шаблоны.
