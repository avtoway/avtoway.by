# Dev Log

## 2026-10-27 — Lint-чистка, FK бренда/модели, тест аренды, анализ конкурента

- [x] **Lint** — 0 ошибок (было 21): `<a>`→`<Link>` в хлебных крошках, удалён мёртвый фильтр бренда/модели и `FiltersPanel`-в-рендере, убран лишний `setLoading(true)`, derived-state для моделей авто, stale-closure в email `load`, неиспользуемые `readFile`/`confirm`
- [x] **FK бренда/модели** — `RentCar.brandId`/`modelId` (FK на `car_brands`/`car_models`, `onDelete: SetNull`), имена резолвятся через `brandRel`/`modelRel`, форма и админка переведены на ID
- [x] **Тест аренды** — полный цикл: guard (401 без авторизации), создание авто с FK, листинг/деталь (200), удаление
- [x] **Анализ конкурента** `pro-service.cc` → `docs/competitor-analysis.md`; план пополнен новыми фичами (калькулятор аренды, задачи-вместо-каталога, акции, портфолио, отзывы, умная форма, сертификаты)
- [ ] Отложено (временно): подключение почты (нужен пароль приложения Gmail), смена пароля админа

### Verification
- typecheck: 0 ошибок · vitest: 22 теста · lint: 0 ошибок · build: успешно · закоммичено в `dev`

## 2026-10-26 — Рефакторинг: безопасность, услуги в БД, заявки

- [x] **Безопасность API** — guard `requireAuth(permission?)`; закрыты авторизацией `/api/rent`, `/api/contacts`, `/api/upload`, `/api/email/*`, `/api/services`, `/api/partners`
- [x] Новые права `rent.manage`, `contacts.manage`, `email.manage` + починен upsert ролей в seed
- [x] `proxy.ts`: проверки прав для rent/contacts/email/requests; `showAll` аренды — только админ
- [x] Убран `svg` из загрузки (XSS-риск)
- [x] **Услуги переведены в БД** — `Service`/`Partner` на Prisma (memory-репозитории удалены), seed заполняет 6 услуг
- [x] Починены баги: `POST /api/services` не создавал запись; маппинг `desc/iconName/href` ↔ `description/icon`; у Partner не было колонки `photos`
- [x] **Заявки** — таблица `contact_requests`, рабочий `/api/contact`, админка `/admin/requests`, форма на `/contacts`
- [x] Справочники `FUEL/TRANSMISSION` → `shared/lib/car-dictionaries.ts`
- [x] Починен `loadUser` (N+1 + «главная роль» по уровню)
- [x] Чистка мёртвого кода (env.ts, config/index, services.ts, service.entity, ServiceColor, youtube types), опечатка `toat-context` → `toast-context`

### Verification
- typecheck: 0 ошибок · vitest: 22 теста · build: успешно · закоммичено и запушено в `dev` (`6b9cbb4`)

## 2026-07-07 — Project init

- [x] Created Next.js 16 + TypeScript + Tailwind project
- [x] Set up GitHub repo (avtoway/avtoway.by)
- [x] Configured VS Code settings, EditorConfig, Prettier
- [x] Created backup/snapshot script
- [x] Set up project structure
- [x] First commit to master

### Decisions
- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Branch strategy:** feature branches → dev → master (Git Flow)
- **Backup:** `scripts/snapshot.ps1` saves full snapshots to `snapshots/`

## 2026-07-07 — Git Flow: dev branch

- [x] Created `dev` branch for testing/staging
- [x] Updated workflow: feature → dev → master

## 2026-07-07 — Landing page

- [x] Created landing page with hero, about, video gallery, services sections
- [x] Set up design system: primary red (#e63946), secondary navy (#1d3557)
- [x] Configured site metadata (title, description, OpenGraph)
- [x] Feature branch: `feature/landing-page` → merged to master

## 2026-07-07 — Branding

- [x] Logo: кириллица АВТО + WAY
- [x] Metadata, titles, description updated to АВТОWAY
- [x] Feature branch: `feature/branding` → merged to dev

## 2026-07-07 — YouTube API

- [x] YouTube Data API v3 integration
- [x] Real video feed from channel
- [x] Shorts filter (by duration)
- [x] Feature branches: `feature/youtube-api`, `feature/filter-shorts-v2` → merged to dev

## 2026-07-07 — Dark theme & modern UI

- [x] Full dark theme (deep black, red accent)
- [x] Scroll reveal animations
- [x] Animated gradient hero background
- [x] Hero YouTube video background
- [x] Video carousel with auto-scroll, dots, drag
- [x] Feature branches: `feature/dark-theme`, `feature/modern-ui`, `feature/hero-video-bg`, `feature/auto-carousel` → merged to dev

## 2026-07-07 — Phase 0: Главная страница

- [x] Новый hero-текст: «Нам можно верить! Делаю то, что не делают другие»
- [x] Новый текст «О проекте» — личный бренд, честность, доверие
- [x] Кнопка «Подробнее о проекте» (заглушка)
- [x] Навигация: Главная, Услуги▾, О нас, Партнёры, Контакты — стеклянная капсула с анимациями
- [x] Кнопка «Смотреть видео» → YouTube канал
- [x] Логотип: крупнее, мягкий белый, анимация + hover scale
- [x] Scroll Progress bar
- [x] `/main` — алиас главной страницы
- [x] MainNav client component с рабочим «Главная» → `/`

## 2026-07-07 — Планирование Phase 2

- [x] Создан roadmap проекта (docs/roadmap.md)
- [x] Список страниц: Услуги, О нас, Контакты, Партнёры
- [x] База данных: PostgreSQL + Prisma
- [x] Админка без регистрации, роли: Admin, Editor, Partner

## 2026-07-07 — Стратегия развития проекта

- [x] Создан `docs/architecture-v2.md` — полная архитектура и стратегия
- [x] Задокументированы все услуги и требования
- [x] Структура: 8 суббрендов (АВТОWAY.*)
- [x] Определены роли, БД-сущности, интеграции
- [x] Карта: 6 фаз развития проекта
- [x] Обновлён roadmap.md

## 2026-07-07 — Release v1.0-beta

- [x] All features merged to dev
- [x] Version bumped to 1.0-beta
- [x] Merged to master
