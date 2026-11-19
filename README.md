# АВТОВЕЙ — сайт автомобильных услуг и панель управления

Публичный сайт (аренда, продажа, автоподбор, перевозки) и полноценная админка: CRM заявок, автопарк, цифровые отчёты осмотра, блог, рекламные блоки и мониторинг.

## Стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16 (App Router, RSC, Proxy) |
| UI | React 19, Tailwind CSS 4 |
| Язык | TypeScript 5 (strict) |
| БД | SQLite + Prisma 7 (`@prisma/adapter-libsql`) |
| Валидация | Zod 4 |
| Тесты | Vitest (unit), Playwright (E2E) |
| Почта | Nodemailer + ImapFlow + mailparser |
| Изображения | sharp (WebP, ресайз) |

## Быстрый старт

```bash
# Node.js 22+
npm ci

cp .env.example .env      # заполнить AUTH_SECRET и ENCRYPTION_KEY
npx prisma db push        # создать схему
npm run db:seed           # демо-данные (опционально)

npm run dev -- -p 3001
```

Сайт: `http://localhost:3001`  
Админка: `http://localhost:3001/admin` (по умолчанию `admin / admin123` — смените перед запуском).

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | dev-сервер |
| `npm run build` | production-сборка (через `scripts/build.mjs`) |
| `npm run start` | запуск собранного приложения |
| `npm run lint` | ESLint (0 ошибок и предупреждений) |
| `npm run typecheck` | проверка типов |
| `npm test` | unit-тесты |
| `npm run test:coverage` | покрытие |
| `npm run test:e2e` | браузерные тесты |
| `npm run db:backup` | бэкап SQLite с проверкой целостности |
| `npm run docs:screenshots` | скриншоты для Word-руководств |
| `npm run docs:build` | сборка документов |

## Структура

```
src/
  app/            маршруты Next.js (публичная часть, админка, API)
  di/             DI-контейнер и composition-root
  entities/       типы, Zod-схемы, интерфейсы репозиториев
  features/       доменные UI-модули
  infrastructure/ Prisma-репозитории
  shared/         UI-кит, утилиты, конфиг
prisma/           схема и миграции
scripts/          seed, бэкапы, документация
tests/            unit и E2E
docs/             эксплуатация, скриншоты, Word-руководства
```

Принципы: Feature-Sliced Design, зависимости через интерфейсы, доступ к БД только через репозитории, серверный пересчёт цен и прав.

## Документация

- [`HANDOFF.md`](./HANDOFF.md) — контекст проекта и история решений
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — архитектура
- [`DEPLOY.md`](./DEPLOY.md) — развёртывание на VPS
- [`SECURITY.md`](./SECURITY.md) — безопасность и чек-лист продакшена
- [`docs/operations.md`](./docs/operations.md) — эксплуатация
- [`docs/TESTING.md`](./docs/TESTING.md) — тестирование

## Docker

```bash
docker compose up -d --build
```

Контейнер работает не от root, имеет healthcheck и применяет схему при старте.

## Публичный доступ: без туннелей

**Публичные туннели (bore, ngrok, serveo, cloudflared, localhost.run и подобные) в проекте не используются.** Причина не только в нестабильности: туннель открывает входящий доступ из интернета к машине, через него уходит трафик формы (имя, телефон) и он проходит через сторонний сервер, а в корпоративной сети такие подключения справедливо считаются обходом периметра. Подробнее — в [`SECURITY.md`](./SECURITY.md).

### Тест с телефона по локальной сети

Ничего наружу не открывается, телефон и компьютер должны быть в одной Wi-Fi-сети.

```powershell
npm run dev -- -p 3001
```

На компьютере узнать адрес:

```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" }).IPAddress
```

На телефоне открыть `http://<IP-компьютера>:3001`. Если Next.js ругается на чужой Origin, добавьте этот IP в `allowedDevOrigins` в `next.config.ts` и перезапустите dev-сервер.

### Публичная демонстрация и продакшен

Только через собственный сервер: VPS + домен + HTTPS по [`DEPLOY.md`](./DEPLOY.md). Тогда сайт работает круглосуточно, не зависит от включённого компьютера, а трафик идёт по HTTPS напрямую к вашему серверу.

Проверка публичного доступа:

- админка доступна только на `localhost`, домене из `NEXT_PUBLIC_SITE_URL` и хостах из `ADMIN_ALLOWED_HOSTS`;
- формы создают реальные заявки в базе;
- на VPS схема БД и бэкапы описаны в `docs/operations.md`.
