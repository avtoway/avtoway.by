<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

> **ВАЖНО: Начни с чтения `HANDOFF.md`** — там полный контекст проекта: история, состояние, план, ключевые файлы, нюансы. Это продолжение предыдущей сессии.

## Дорожная карта

- **CRM для заявок (future):** приём заявок из Telegram, Instagram, Viber, WhatsApp — заявки приходят на свой сервер, ответ через админку. Единая лента обращений, история переписки, назначение ответственного.
- **Финансовый учёт:** приход/расход по каждой услуге, расчёт налогов и прибыли, интеграция с историей авто (RentCarHistory).
- **Почта:** SMTP/IMAP реализованы, пароли хранятся в БД в зашифрованном виде (AES-256-GCM, ключ `ENCRYPTION_KEY` в `.env`). Сейчас настроен тестовый Gmail. Нужно: создать ящик `info@avtoway.by` в cPanel, получить пароль, вбить в `/admin/email` → Настройки (`mail.avtoway.by` для SMTP и IMAP), проверить отправку и получение. В будущем — цепочки писем, шаблоны.

## Генерация изображений (MCP `imagegen`)

- Сервер: `mcp/imagegen` (Node, stdio). Подключён в `opencode.json` → инструменты `imagegen_*`.
- Инструменты: `list_models`, `recommend_model`, `generate_image`, `edit_image`, `list_generated`, `check_setup`.
- Результат: `public/images/generated/` — `<name>.webp`, `<name>@1024.webp`, `<name>@640.webp`, `<name>.json` (промпт, модель, seed, цена).
- Ключи API: `mcp/imagegen/.env` (шаблон `.env.example`), не коммитить. Без ключей сервер отдаёт инструкцию, что добавить.
- Промпты и правила: `mcp/imagegen/PROMPTS.md`. Документация: `mcp/imagegen/README.md`.
- Правило: для черновиков `flux-schnell`, для финала `flux-1.1-pro`/`imagen-4`, текст на картинке — `ideogram-3`/`gpt-image-1`. Текст для сайта верстать в HTML, а не рисовать на картинке.

