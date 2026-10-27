# Dev Log

## 2026-10-27 — Тарифные ступени в админке

- [x] Таблица `rent_pricing_tiers` (minDays / maxDays / discount %) — вместо хардкод-скидок в настройках
- [x] Сид 5 ступеней: 1–2 → 0%, 3–7 → 10%, 8–14 → 17%, 15–30 → 25%, 31+ → 32% (по PRICING-PROMPT)
- [x] Новая вкладка «Тарифы» в `/admin/rent/calculator` — добавление/редактирование/удаление ступеней
- [x] `price.ts`: `findTier` / `getPerDayRate` / `getPeriodPrices` / `calculateRentPrice` работают по ступеням из БД
- [x] API `/api/rent/pricing-tiers` (GET публичный, POST/PUT/DELETE — admin)
- [x] Калькулятор и детальная страница читают ступени из БД; настройки упрощены до мин/макс срока
- [x] 36 юнит-тестов (ступени, границы периодов, такси)

### Verification
- typecheck: 0 ошибок · vitest: 36 тестов · lint: 0 ошибок · build: успешно

## 2026-10-27 — Ценовая модель carlux + условия аренды

- [x] **Новая ценовая модель** (личные цели): базовая цена за сутки + скидки за срок 3–7/8–14/15–31 суток (по умолчанию 20/25/30%), настраиваются в админке
- [x] **Такси** — отдельно: только от недели, цена за неделю (мин. 7 дней в калькуляторе)
- [x] Убраны устаревшие поля `price3Days`/`priceMonth`; `calculateRentPrice` переписан под %-модель + 33 юнит-теста
- [x] **Условия аренды** — таблицы `rent_conditions` + `rent_car_conditions`: шаблоны (возраст, стаж, залог, пробег, документы, выезд за границу), галочки + значение в форме авто, вывод на странице авто внизу
- [x] Настройки калькулятора: скидки + мин/макс срок; вкладка «Условия» в админке

### Verification
- typecheck: 0 ошибок · vitest: 33 теста · lint: 0 ошибок · build: успешно

## 2026-10-27 — Калькулятор аренды и классы авто

- [x] **Класс автомобиля** — таблица `car_classes` (8 классов: Эконом→Премиум, SUV, Минивэн, Электро), поля `deposit`/`minAge`; `RentCar.classId` FK
- [x] **Доп. опции** — таблица `rent_extras` (кресло, доставка, страховка…), `perDay`/`perRental`
- [x] **Заявки из калькулятора** — таблица `rent_requests` (авто, даты, дни, опции, итог, залог, статус)
- [x] **Публичный калькулятор** `/services/rent/calculator`: авто → даты → опции → итог + заявка
- [x] **Логика цены** `calculateRentPrice` (ступенчатые тарифы) + юнит-тесты (11 шт.)
- [x] **Админка** `/admin/rent/calculator` (Классы / Опции / Настройки / Заявки) + пункт меню
- [x] Класс добавлен в форму авто, таблицу админки, листинг (фильтр) и детальную страницу

### Verification
- typecheck: 0 ошибок · vitest: 33 теста · lint: 0 ошибок · build: успешно

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
