<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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

## Безопасность: публичные туннели запрещены

- **Не предлагать и не запускать туннели** (bore, ngrok, serveo, cloudflared, localhost.run, pinggy и аналоги) — ни для демонстрации, ни «на пять минут». Причина: входящий доступ из интернета к машине, трафик форм идёт через третью сторону (часто без шифрования), в корпоративной сети это фиксируется как инцидент ИБ.
- Проверка с телефона — только по локальной сети: `http://<IP-компьютера>:3001`, при необходимости добавить IP в `allowedDevOrigins` (`next.config.ts`).
- Публичный доступ — только VPS с доменом и HTTPS по `DEPLOY.md`.
- Админка ограничена по хосту (`src/shared/lib/admin-host.ts`): `localhost`, домен `NEXT_PUBLIC_SITE_URL`, список `ADMIN_ALLOWED_HOSTS`. Это правило не ослаблять.
- Подробности и обоснование — в `SECURITY.md` («Публичные туннели не используем»).

## Git и GitHub (MCP `git`)

- Сервер: `mcp/git` (Node, stdio). Подключён в `opencode.json` → инструменты `git_*` и `gh_*` (42 инструмента).
- Локальный git: status/log/diff/show/blame/grep, ветки, коммиты, merge/rebase/cherry-pick/revert, stash, теги, worktree, submodules, remotes, fetch/pull/push/clone, gc/fsck.
- GitHub через `gh` CLI (нужен `gh auth login`): repo, PR, issues, releases, Actions, произвольный `gh_api`.
- Безопасность: работа только внутри корня проекта (расширяется `GIT_MCP_ALLOWED_ROOTS`); разрушительные операции требуют `confirm=true`; `GIT_MCP_DRY_RUN=1` — только предпросмотр команд.
- Проверка: `cd mcp/git && npm install && npm run smoke && npm run test:tools`. Документация: `mcp/git/README.md`.

