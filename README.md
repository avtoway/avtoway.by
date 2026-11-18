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
