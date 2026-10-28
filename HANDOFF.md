# HANDOFF — Полный контекст проекта АВТОWAY

> **Цель этого файла:** передать новому агенту (opencode) полный контекст проекта, чтобы новая сессия стала почти продолжением предыдущей. Читай внимательно — здесь вся история, состояние, решения и план.

---

## 1. Что это за проект

**АВТОWAY** (`avtoway.by`) — сайт для авто-бренда Виктора. Виды услуг:
- Аренда авто (активно развивается — основной модуль)
- Автоподбор / осмотр
- Продажа авто
- Эвакуатор, автопригон, таксопарк, автосервис, детейлинг (будущие лендинги)

Есть публичная часть (marketing) и админ-панель (dashboard).

---

## 2. Технологический стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16.2.10 (App Router, Server Components) |
| React | 19 |
| Язык | TypeScript 5 |
| Стили | Tailwind CSS 4 |
| ORM | Prisma 7.8 + libSQL adapter (`@prisma/adapter-libsql`) |
| БД (dev) | SQLite `data/avtoway.db` |
| БД (prod) | PostgreSQL (Docker Compose) |
| Тесты | Vitest 4 (22 теста) |
| Почта | nodemailer (SMTP) + imapflow (IMAP) |
| Авторизация | логин/пароль, bcryptjs, HMAC-токен в cookie `admin_token` (24ч) |
| CI | GitHub Actions (lint → typecheck → test → build) |

**ВАЖНО про Next.js:** в `node_modules/next/dist/docs/` лежат гайды этой версии. Версия НЕ такая, как в тренировочных данных — читай гайды перед написанием кода (см. AGENTS.md).

---

## 3. Структура проекта (Feature-Sliced Design)

```
src/
  app/                    # Маршруты (Next.js App Router)
    (marketing)/          # Публичные страницы
    (dashboard)/admin/    # Админка
    api/                  # API Routes
  di/                     # DI-контейнер + composition-root
  entities/               # Сущности (types, schemas, repositories)
  features/               # Фичи (UI-компоненты по модулям)
  infrastructure/         # Репозитории Prisma
  lib/                    # auth.server.ts, audit.server.ts
  shared/                 # UI-компоненты, конфиги, утилиты
scripts/seed.ts           # Сид БД
prisma/schema.prisma      # Схема БД
```

---

## 4. Схема БД (prisma/schema.prisma)

Все модели:

| Модель | Таблица | Назначение |
|---|---|---|
| User | users | Пользователи админки |
| Profile | profiles | Профиль (ФИО, фото, контакты) |
| Role | roles | Роли (Администратор/Редактор/Наблюдатель) |
| RolePermission | role_permissions | Права роли |
| UserRole | user_roles | Связь пользователь-роль |
| AuditLog | audit_logs | Аудит действий |
| Service | services | Услуги (для публичной части) |
| Partner | partners | Партнёры |
| Setting | settings | Ключ-значение (SMTP/IMAP конфиг и др.) |
| RentType | rent_types | Тип аренды (Аренда, Под такси) |
| RentCar | rent_cars | Автомобили для аренды |
| RentCarHistory | rent_car_history | История авто (обслуживание, ремонт, налоги и т.д.) |
| CarClass | car_classes | Класс автомобиля (Эконом…Премиум, SUV, Минивэн, Электро) + залог и мин. возраст |
| RentExtra | rent_extras | Доп. опции калькулятора (кресло, доставка, страховка…) |
| RentRequest | rent_requests | Заявки из калькулятора аренды |
| RentCondition | rent_conditions | Шаблоны условий аренды (возраст, стаж, залог…) |
| RentCarCondition | rent_car_conditions | Применённые к авто условия (join) |
| RentPricingTier | rent_pricing_tiers | Тарифные ступени: период (от/до дней) + % скидки |
| CarBrand | car_brands | Марки авто |
| CarModel | car_models | Модели авто |
| Fuel | fuels | Типы топлива (7, как на av.by) |
| Transmission | transmissions | Коробки передач (4) |
| ComfortFeature | comfort_features | Опции комфорта (14) |
| Contact | contacts | Контактная информация сайта (singleton) |
| ContactRequest | contact_requests | Заявки с сайта (форма обратной связи) |
| SentEmail | sent_emails | Отправленные письма |
| InboxEmail | inbox_emails | Входящие письма (кеш из IMAP) |
| SaleCar | sale_cars | Автомобили в продаже (каталог `/services/sell`) |
| SaleRequest | sale_requests | Заявки на осмотр, trade-in и продажу своего авто |

### Ключевые поля RentCar
`name, slug, brandId, modelId, classId, year, color, transmission, fuel, engineVolume, seats, features (CSV строка), photos (CSV), mainPhoto, description, priceDay, price7Days, priceDayTaxi, rentTypeId, isActive, bookedUntil, sortOrder`

Связи: `brandRel`/`modelRel`/`classRel` (резолв имён), `rentType`, `conditions` (условия аренды).

Цены зависят от типа аренды:
- **Аренда / личные цели** (rent): базовая цена за сутки `priceDay` + скидка по тарифной ступени (`rent_pricing_tiers`: период дней + % скидки, управляется в админке)
- **Под такси** (taxi): только от недели, цена за неделю `price7Days` (+ `priceDayTaxi` — среднее за день для отображения)

---

## 5. Что уже сделано (история, сгруппировано)

### 5.1 Аутентификация и админка
- Вход `/admin/login`, токен в HMAC-подписанной cookie
- 3 роли: Администратор (100), Редактор (50), Наблюдатель (10)
- Права: `users.manage`, `users.roles`, `services.manage`, `partners.manage`, `audit.view`
- Меню в админке формируется API `/api/admin/menu` с фильтром по правам
- CRUD: пользователи, роли, услуги, партнёры, аудит-логи

### 5.2 Модуль аренды (главный)
- **Админка `/admin/rent`**: таблица авто, статусы (Активен/Скрыт/Бронь), CRUD-модалка, управление типами аренды
- **Форма авто**: фотогалерея (до 20 фото, выбор главного), марка/модель из БД (каскад), топливо/коробка из БД, условные цены по типу аренды, `bookedUntil`
- **Публичный листинг `/services/rent`**: быстрый фильтр по типу аренды («Все авто» / «Для личных целей» / «Под такси» с количеством) + фильтры слева (тип, цена, коробка, топливо, места, комфорт), горизонтальные карточки со ВСЕМИ ценами + USD-эквивалент
- **Детальная страница `/services/rent/[slug]`**: фотогалерея, характеристики, опции, все цены + USD, блок «Связь с нами»
- **Опции комфорта** — вынесены из кода в БД (таблица `comfort_features`, API `/api/comfort-features`)
- **История авто** — панель в модалке редактирования (обслуживание, ремонт, страховка, налог, мойка, топливо, бронь, прочее)
- Марки/модели авто (~25 марок, ~120 моделей), топливо и коробки засеяны

### 5.3 Валюта
- BYN (белорусский рубль) — основная
- Курс USD с NBRB API (`api.nbrb.by/exrates/rates/431`), кэш на сутки
- API `/api/exchange-rate`

### 5.4 Контакты (недавно)
- Таблица `contacts` (singleton): телефон, email, telegram, viber, whatsapp, instagram, youtube, rutube, vk, адрес, часы работы
- **Админка `/admin/contacts`**: режим просмотра + кнопка «Редактировать» (toggle)
- **Публичная `/contacts`**: красивая страница с карточками, мессенджерами, соцсетями
- Footer, страница «О проекте», JSON-LD — всё тянет контакты из БД
- **Telegram**: `https://t.me/avtoway_by` (редактируется в `/admin/contacts`). `telegramUrl()` / `telegramHandle()` в `src/shared/lib/social.ts` принимают и URL, и `@handle`

### 5.5 Почта (недавно)
- **Админка `/admin/email`**: 3 вкладки — Входящие / Отправленные / Настройки
- **Входящие**: кнопка «Обновить» (загрузка из IMAP), список, открытие письма (двухпанельный вид), ответить/переслать/удалить, чекбоксы массового удаления, **поиск**
- **Отправленные**: список с раскрытием тела
- **Настройки**: SMTP (отправка) + IMAP (получение)
- **Безопасность**: пароли SMTP/IMAP шифруются AES-256-GCM (`src/shared/lib/encryption.ts`, ключ `ENCRYPTION_KEY`). GET API возвращает маску `••••••••`, PUT шифрует. UI: «Оставьте пустым, чтобы не менять»
- API: `/api/email`, `/api/email/sent`, `/api/email/inbox`, `/api/email/inbox/[id]`, `/api/email/refresh`, `/api/email/smtp`
- `src/shared/lib/mail.ts` — sendEmail() + fetchInboxEmails() через nodemailer/imapflow

### 5.6 Публичные страницы
- Главная (hero, видео-карусель, услуги)
- `/services` + `/services/[slug]` (динамические)
- `/about` (с соцсетями из БД)
- `/contacts` (см. выше) + форма заявки
- Редиректы: `/rent`, `/sell`, `/inspection` → `/services`

### 5.7 Рефакторинг, безопасность и заявки (26.10.2026)
- **Безопасность API**: добавлен guard `requireAuth(permission?)` в `auth.server.ts`. Все мутирующие API-роуты (`/api/rent`, `/api/contacts`, `/api/upload`, `/api/email/*`, `/api/services`, `/api/partners`) теперь требуют авторизацию + права. Из загрузки убран `svg` (XSS), `showAll=true` у аренды — только для админа.
- **Новые права**: `rent.manage`, `contacts.manage`, `email.manage` (добавлены в seed, upsert ролей починен).
- **Услуги в БД**: `Service`/`Partner` переведены на Prisma в dev и prod (memory-репозитории удалены). Услуги засеваются в таблицу `services`. Починены скрытые баги: `POST /api/services` не создавал запись; маппинг полей `desc/iconName/href` ↔ `description/icon`; у Partner не было колонки `photos` (альбом терялся).
- **Заявки**: таблица `contact_requests` + репозиторий + рабочий `/api/contact` (раньше сообщения терялись). Новая админка **`/admin/requests`** (статусы, удаление). Публичная форма на `/contacts`.
- **Справочники**: `FUEL/TRANSMISSION` вынесены в `src/shared/lib/car-dictionaries.ts` (было в 3 файлах).
- **Чистка**: удалены мёртвые `env.ts`, `config/index`, `services.ts`, `service.entity`, `ServiceColor`, `youtube.ts` типы; исправлена опечатка `toat-context` → `toast-context`; починен `loadUser` (N+1 + «главная роль» по уровню).

### 5.8 Изображения, иконки и загрузка файлов (26.10.2026)
- **Брендовые ассеты** генерируются скриптом `scripts/images-build.mjs`: `src/app/icon.png` (512), `apple-icon.png` (180), `favicon.ico` (32), `opengraph-image.jpg` + `twitter-image.jpg` (1200×630). В `layout.tsx` добавлены `metadataBase` (env `NEXT_PUBLIC_SITE_URL`) и `twitter.card`
- **OG-картинка** по умолчанию собирается из `public/videos/hero-poster.jpg` с тёмным градиентом и брендингом; своя — через `assets-src/og.jpg`
- **Заглушка** `public/images/placeholder-car.webp` (1600×900) вместо эмодзи 🚗 — в `photo-gallery.tsx` и карточках листинга аренды
- **Обложки услуг**: у всех 6 услуг `services.photo = null`. Исходники кладутся в `assets-src/services/{rent,sell,inspection,truck,import,service}.{jpg,png,webp}` → `npm run images:build` (WebP 1600×900, ≤300 КБ) → `npm run images:apply` (прописывает `services.photo`). Флаг `--crop-bottom=9` срезает watermark (Pollinations)
- **Загрузка файлов**: `/api/upload?category=partners|rent|avatars|services|general` — раскладывает по подпапкам `public/uploads/*`; расширение берётся из MIME, а не из имени файла (раньше всё падало в `uploads/partners`)
- **Бриф на генерацию** (промпты, единый стиль, модели и цены): `docs/IMAGE-BRIEF.md`

### 5.9 Калькулятор аренды, классы и условия (27.10.2026)
- **Класс автомобиля** — таблица `car_classes` (Эконом → Комфорт → Комфорт+ → Бизнес → Премиум → SUV/Кроссовер → Минивэн → Электро), с полями `deposit` (залог) и `minAge` (мин. возраст водителя). `RentCar.classId` → FK.
- **Доп. опции** — таблица `rent_extras` (детское кресло, доставка, страховка и т.д.), тип цены `perDay`/`perRental`.
- **Публичный калькулятор** `/services/rent/calculator`: выбор авто (фильтры по типу аренды/классу/марке) → даты → опции → итог + заявка.
- **Логика цены** (`calculateRentPrice` в `price.ts`, %-модель как у carlux):
  - *личные цели*: базовая цена за сутки `priceDay` + скидка по тарифной ступени из таблицы `rent_pricing_tiers` (по умолчанию 5 ступеней: 1–2 → 0%, 3–7 → 10%, 8–14 → 17%, 15–30 → 25%, 31+ → 32%).
  - *такси*: только от недели, `Math.ceil(дни/7) × price7Days`.
- **Заявки** — таблица `rent_requests` (авто, даты, дни, опции, итог, залог, статус), POST публичный, админка в `/admin/rent/calculator` → вкладка «Заявки».
- **Условия аренды** — таблица `rent_conditions` (шаблоны: возраст, стаж, залог, пробег, документы, выезд за границу) + `rent_car_conditions` (join). В форме авто — галочки + значение; на странице авто выводятся внизу как «Условия аренды».
- **Админка** `/admin/rent/calculator` (6 вкладок): Классы · Доп. опции · Условия · **Тарифы** (ступени: от/до дней + % скидки — добавить/изменить/удалить) · Настройки (мин/макс срок) · Заявки. В форме авто — «Класс» и «Условия», в таблице — колонка «Класс».
- **Фильтр по классу** добавлен в листинг аренды + бейдж класса на детальной странице и карточке авто.
- **Фильтр по типу аренды** («Все авто» / «Для личных целей» / «Под такси» с количеством) — в листинге и калькуляторе; названия типов берутся из БД (`rent_types.name`) и редактируются в админке.
- **Заявка из калькулятора** — телефон или email обязателен; сумму, залог, дни и список опций считает сервер (`src/shared/lib/rent-request.ts`), клиентские `total`/`deposit` игнорируются.

### 5.10 Безопасность форм и почты (27.10.2026)
- **Почта**: тело входящего/отправленного письма рендерится через `EmailBody` (DOMPurify, `ssr: false`) — XSS из письма закрыт.
- **Публичные формы**: zod-валидация заявки на аренду (длины, email, реальные даты, контакт), серверный пересчёт стоимости, проверка активности авто и сроков.
- **Rate limit** в `src/proxy.ts`: логин 5/15 мин, публичные POST (`/api/rent/requests`, `/api/contact`) — 10/10 мин на IP. In-memory, для нескольких инстансов нужен Redis.

### 5.11 Автоподбор: лендинг и админка (27.10.2026)
- **Публичный лендинг `/services/inspection`**: hero с CSS-иллюстрацией проверки и маленьким фото эксперта (без AI-фото), квиз в 1 шаг (3 задачи), 4 риска, 6 тарифов без табов (3 основных + 3 дополнительных), 4 этапа, 24 проверки по 6 категориям, гарантии, эксперт, отзывы (скрыты без данных), 5 FAQ, финальная форма с «Дополнительно», sticky CTA. Между проверками и гарантиями — CTA-мосты. География убрана (города остались в форме), «Подбор из-за границы» убран, демо-пример отчёта и кейсы — тоже.
- **Админка `/admin/inspection`** (7 вкладок): Обзор (счётчики + график 14 дней), Контент (hero/эксперт/контакты/SEO/гарантия/дисклеймер + заголовки секций), Тарифы, Как работаем (этапы/проверки/риски/преимущества/гарантии/trust), Доказательства (отзывы/FAQ), Заявки, Настройки.
- **БД (13 таблиц)**: `autopodbor_settings`, `_sections`, `_tariffs`, `_steps`, `_features`, `_check_items`, `_cases`, `_reviews`, `_faq`, `_gallery`, `_cities`, `_promos`, `_leads` (+ связь с `User` для ответственного). CSV/JSON хранятся строками.
- **Права**: `autopodbor.view` / `autopodbor.manage` / `autopodbor.requests`. Пункт меню «Автоподбор» с badge новых заявок; guard в `src/proxy.ts`; аудит всех мутаций.
- **API**: публичные `GET /api/autopodbor`, `POST /api/autopodbor/leads` (zod, honeypot, rate limit 5/10 мин); админские CRUD `/api/autopodbor/{entity}` (generic по реестру), `/settings`, `/stats`, `/assignees`, `/leads`, `/leads/export` (CSV), `/revalidate`.
- **Заявки**: сервер берёт название и цену услуги из БД, клиентские суммы не сохраняются; фильтры по статусу/услуге/городу/датам, поиск, статусы, ответственный, заметка, быстрые контакты, экспорт.
- **Seed**: 6 тарифов, 4 этапа, 24 проверки, 14 карточек, 5 FAQ, 18 городов, 10 секций. Отзывы не выдумываются, кейсы/демо не создаются. «Подбор из-за границы» можно вернуть тарифом с группой `abroad`.
- **Изображения**: hero — CSS-панель проверки + маленькое реальное фото эксперта; сгенерированные hero/OG удалены. OG — дефолтный `/opengraph-image.jpg`; эксперт — `/images/avatar.jpg`. MCP `imagegen` отключён (`disabled: true`). Промпты на будущее — `docs/autopodbor-images-prompts.md`.
- **Юридика**: страница `/privacy` (базовый текст, нужно согласовать с юристом), дисклеймер и цены редактируются в админке.

### 5.12 Адаптивность, SEO и масштабируемость (28.10.2026)
- **Reveal**: больше не скрывает контент (`opacity: 0` убран). Контент виден без JS и для краулеров; с JS — только сдвиг 14px. Добавлены `js`-класс в `<head>`, `prefers-reduced-motion`, `data-scroll-behavior="smooth"`.
- **Изображения**: публичные `<img>` переведены на `next/image` (услуги, карточка услуги, аренда, калькулятор, фотогалерея). Админ-превью оставлены `<img>` из-за blob/локальных превью. Аватар в hero и `/about` — eager.
- **SEO**: динамический `sitemap.ts` (услуги из БД + активные авто, `revalidate=3600`), breadcrumbs UI + `BreadcrumbList` JSON-LD на публичных страницах, canonical/OG для услуг/аренды/калькулятора/карточек, `SITE_URL` в `src/shared/config/site.ts`, hreflang `ru` в root metadata.
- **Metadata**: `services/rent` и калькулятор получили `layout.tsx` с metadata (страницы клиентские). `privacy` индексируется, canonical `/privacy`.
- **Видео**: если YouTube API не настроен/нет роликов — секция не рендерится; сообщение про `.env.local` убрано.
- **Главная**: секция «О проекте» получила фон, градиент, бейдж и более контрастный текст.
- **Архитектурный план**: `docs/architecture/scalability-crm-seo.md` — ServiceModule, унифицированная CRM (`leads`, `lead_messages`, `lead_status_history`), миграция старых заявок без потери данных, города, блог, интеграции, финансы, SEO-чеклист. Схема БД **не применялась** — это проект на согласование.
- **Проверки**: typecheck OK, eslint 0 errors (77 warnings), 55 tests, build успешен.

### 5.13 Продажа авто: каталог, карточка и админка (28.10.2026)
- **БД**: `sale_cars` + `sale_requests`; связи `SaleCar` с `CarBrand`/`CarModel`. Поля: цена USD/BYN, характеристики, история, отчёт эксперта, комплектация, SEO, статусы, 40 фото.
- **Публичный каталог `/services/sell`**: компактный hero, фильтры (марка/модель/поколение, цена USD/BYN, год, КПП, топливо, объём, кузов, привод, пробег, проверки, trade-in), сортировка, сетка/список, мобильная шторка, URL-синхронизация, карточки с hover-прокруткой фото, ценой в двух валютах и бейджами. Внизу — блок продажи своего авто с формой.
- **Карточка `/services/sell/[slug]`**: галерея до 40 фото + fullscreen lightbox (клавиши/свайп/колесо), ключевые параметры, отчёт эксперта, сгруппированные характеристики без пустых полей, описание, комплектация по категориям, похожие авто, sticky-цена, мобильная нижняя панель.
- **Заявки**: публичная форма (buy / trade_in / sell_own), honeypot, rate limit; админка `/admin/sell` — 2 вкладки «Автомобили»/«Заявки», быстрый статус, активность, поиск, фильтры, менеджер фото до 40 (drag-and-drop, пачки по 4, порядок, главная, удаление), custom specs, SEO.
- **API**: `/api/sell` (GET/POST), `/api/sell/[id]` (GET/PATCH/DELETE), `/api/sell/requests` (GET/POST), `/api/sell/requests/[id]` (PATCH/DELETE); `requireAuth("sell.manage")`, audit, `revalidatePath`.
- **SEO**: canonical/OG, `Car`+`Offer` JSON-LD, breadcrumbs, sitemap (6 demo cars + услуга), динамические метаданные.
- **Права/меню**: `sell.manage` в seed (Администратор/Редактор), пункт «Продажа авто» в разделе «Услуги» с badge новых заявок, proxy guard.
- **Демо-данные**: 6 авто (BMW 530i, Toyota Camry, Passat B8, Geely Monjaro, Audi A6, Tesla Model 3) с фото в `public/uploads/sell/demo-*.jpg`, характеристиками, комплектацией и отчётами. Seed идемпотентный.
- **Проверки**: typecheck OK, eslint 0 errors (85 warnings), 68 tests, build успешен; API create/patch/delete и заявки проверены вручную.

### 5.14 Аренда: новая витрина и демо-парк (28.10.2026)
- **Каталог `/services/rent`** переработан в витрину: hero с количеством авто и CTA, фильтры в карточке, мобильная шторка, сортировка, сетка/список, URL-параметры.
- **Серверный рендер**: `RentCarRepository` + `comfortFeature` + тарифные ступени + курс НБРБ; каталог не ждёт клиентских fetch.
- **Карточки**: фото с hover-прокруткой, класс/тип/бронь, цена BYN + USD, опции, ссылка на карточку.
- **Карточка аренды**: общий fullscreen-lightbox `shared/ui/photo-lightbox-gallery.tsx`, блок похожих авто.
- **Админ-форма аренды**: вкладки «Основное / Фото / Цены и аренда / Опции», фото до 40 (drag-and-drop, пачки по 4, порядок/главная), автозаполнение названия/slug, поиск опций, USD-подсказка, клиентская валидация, sticky-футер. Общий `shared/ui/admin/photo-manager.tsx` используется и для продажи.
- **Демо-парк**: `scripts/seed-rent.ts` — Hyundai Solaris, Kia Rio (такси), Passat B8, BMW 530i, Mercedes E 200, VW Touran; фото `public/uploads/rent/demo-*.jpg`, условия аренды, цены.
- **Проверки**: typecheck OK, eslint 0 errors (85 warnings), 68 tests; `/services/rent`, карточки и sitemap 200.

---

## 6. Технические решения и паттерны

### DI-контейнер
`src/di/container.ts` + `src/di/composition-root.ts`. Репозитории регистрируются и достаются через `container.get<T>("Token")`. Все репозитории — Prisma (dev и prod, единообразно). **ВАЖНО:** API-роуты импортируют `@/di/composition-root` в начале.

### Авторизация API (guard)
`requireAuth(permission?)` в `src/lib/auth.server.ts` — хелпер для API-роутов: требует залогиненного пользователя и опционально конкретное право. Кидает `AuthError` (401) / `ForbiddenError` (403), обрабатывается `toApiError()`. Пример: `await requireAuth("rent.manage")`.

### Ошибки
Иерархия: `AppError`, `AuthError`, `ForbiddenError`, `NotFoundError`, `ValidationError`, `ConflictError`. Хелпер `toApiError()` в `src/shared/lib/errors.ts`.

### Валидация
Zod-схемы + хук `useFormValidation`, компонент `FieldError`, `validateOrResponse`.

### UX
- Toast-уведомления (`ToastProvider`, `useToast`)
- Confirm-диалог (`useConfirm`) — вместо нативного confirm
- ErrorBoundary

### Миграции БД
**КРИТИЧНО:** `prisma migrate reset` УНИЧТОЖАЕТ данные. Пользователь просил сохранять БД. Новые таблицы/колонки добавляются через `npx prisma db push --accept-data-loss` (не сбрасывает данные). После изменения схемы: `prisma db push` → `prisma generate` → **перезапустить dev-сервер** (старый клиент не видит новые модели — ошибка `Cannot read properties of undefined (reading 'create')`).

---

## 7. Запуск и env

### env-файлы
- `.env` — DATABASE_URL для SQLite
- `.env.local` — YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID, DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY
- `.env*` в .gitignore (не коммитятся)

### Команды
```bash
npm install
npx prisma db push
npx prisma generate
npm run db:seed        # tsx scripts/seed.ts
npm run images:build   # WebP услуг + иконки + OG + заглушка
npm run images:apply   # то же + запись services.photo в БД
npm run dev            # http://localhost:3000
npm run lint
npx vitest run
npm run build && npm run start
```

Админка: `/admin/login`, вход **admin / admin123** (сменить после входа!).

### Seed создаёт
Админа, роли, типы аренды (Аренда, Под такси), 6 услуг (rent/sell/inspection — активны; truck/import/service — скрыты), 7 видов топлива, 4 коробки, ~25 марок авто + модели, 14 опций комфорта, контактную строку, SMTP-настройки-заглушки.

---

## 8. Текущее состояние (важно!)

1. **Рабочее дерево чистое** — последние изменения (lint-чистка, FK бренда/модели, тест аренды) закоммичены в `dev` и запушены. Документация анализа конкурента: `docs/competitor-analysis.md`
1.1. **Автоподбор** — лендинг `/services/inspection` + админка `/admin/inspection` готовы (см. §5.11). Hero с CSS-иллюстрацией и маленьким фото эксперта, OG — дефолтный, `imagegen` отключён; без AI-фото. Цены/гарантии/юридические тексты требуют утверждения владельцем.
2. **Git-авторизация**: GitHub CLI (`gh`) установлен, вход под `avtoway`, git берёт токен через `gh auth git-credential`. Старый засвеченный classic-токен (`ghp_...`) отозван пользователем
3. **Почта НЕ подключена к реальному ящику** — SMTP/IMAP настроены как тест. Пользователь планировал привязать временно свой Gmail (нужен пароль приложения), потом `info@avtoway.by` (создать в cPanel на hoster.by)
4. **Хостинг**: общий cPanel на hoster.by НЕ подходит для этого проекта (нужен Node.js + PostgreSQL + фоновые процессы). Решение — VPS hoster.by (~70-105 BYN/мес) или Hetzner (~€4-8/мес). Покупать ПОСЛЕ завершения сайта
5. **Домен** `avtoway.by` оплачен до 13.02.2027 — продлевать обязательно, это главный актив

---

## 9. План — что делать дальше (по приоритету)

### Сделано (27.10.2026)
1. ✅ **Почистить lint** — 0 ошибок (было 21): `<a>`→`<Link>`, удалён мёртвый фильтр бренда/модели, `setState`-в-effect, «компонент-в-рендере»
3. ✅ **Протестировать модуль аренды** — полный цикл: guard (401), создание авто, листинг/деталь (200), удаление
5. ✅ **Связать `RentCar.brand/model` через FK** — добавлены `brandId`/`modelId` (FK на `car_brands`/`car_models`, `onDelete: SetNull`), имена резолвятся через связь, форма и админка переведены на ID
6. ✅ **Автоподбор** — лендинг `/services/inspection` + админка `/admin/inspection` по ТЗ (`docs/autopodbor-landing-prompt.md`). См. §5.11

### Отложено (временно, нужны данные от владельца)
2. ⏸ **Подключить почту** — нужен пароль приложения Gmail (или ящик `info@avtoway.by`)
4. ⏸ **Сменить пароль админа** — нужно решение владельца о новом пароле

### Среднесрочно (дор. карта в AGENTS.md)
6. **CRM для заявок**: источник заявки (услуга/страница), уведомление на email/Telegram при новой заявке, история переписки, назначение ответственного
7. **Финансовый учёт**: приход/расход по каждой услуге, налоги, прибыль, интеграция с RentCarHistory
8. **Почта**: цепочки писем, шаблоны
9. **Остальные услуги**: продажа, автоподбор, эвакуатор, пригон, таксопарк, СТО, детейлинг (по roadmap.md)

### Новые фичи (из анализа pro-service.cc — см. `docs/competitor-analysis.md`)
10. ✅ **Калькулятор аренды** — готов (`/services/rent/calculator` + админка `/admin/rent/calculator`, классы/опции/настройки/заявки). См. §5.9
11. 🥈 **Задачи вместо каталога** на `/services` — «Арендовать на выходные», «Авто под такси», «Пригнать/купить», «Осмотр перед покупкой» → набор услуг
12. 🥉 **Акции** — модуль «Спецпредложения» со скидками на аренду
13. **Портфолио «Наши работы»** — для сервиса/импорта/продажи, фильтр по марке (FK уже готов), «до/после»
14. **Отзывы + клиенты** — интеграция Google/Яндекс-отзывов, «Наши клиенты» на базе `Partner`
15. **Умная форма заявки** — «способ связи» (звонок/Telegram/WhatsApp/Viber) + фото + согласия (ложится в CRM roadmap)
16. **Подарочные сертификаты** — «подари аренду на выходные»
17. **SEO-каркас** — хлебные крошки, `robots.txt` с правилами API, правовые страницы (Закон о персональных данных РБ)

### Долгосрочно
18. VPS + деплой, интеграция av.by API, мобильное приложение (API должен работать и для мобилок)

---

## 10. Чек-лист тестирования

### Почта `/admin/email`
- [ ] Настройки → ввести Gmail (пароль приложения)
- [ ] «Написать» → отправить себе → проверить доставку
- [ ] «Обновить» во Входящих → письма подтягиваются
- [ ] Открыть, ответить, переслать, удалить
- [ ] Поиск по входящим
- [ ] Пароль в поле маскируется (не возвращается из API)

### Аренда `/admin/rent` + `/services/rent`
- [ ] Создать авто (фото, марка/модель, комфорт из БД, цены)
- [ ] Добавить запись в историю авто
- [ ] Карточка: все цены + USD, бронь, контакты внизу
- [ ] Фильтры на листинге (тип, цена, комфорт)
- [ ] Заявка без телефона/email → 400 «Укажите телефон или email»
- [ ] Заявка с поддельным `total` → сервер считает сумму сам (ступени + опции)
- [ ] Такси: 3 дня → 400, 8 дней → 2 недели
- [ ] 11-я заявка подряд с одного IP → 429

### Контакты `/admin/contacts` + `/contacts`
- [ ] Кнопка «Редактировать» → изменить → сохранить
- [ ] Изменения видны: футер, `/about`, карточка авто, `/contacts`

### Заявки `/admin/requests` + `/contacts`
- [ ] Оставить заявку в форме на `/contacts` → появилась в админке
- [ ] Сменить статус (новая → в работе → готово) → сохраняется
- [ ] Удалить заявку

### Общее
- [ ] `npm run lint` (0 ошибок, 64 warning'а — см. §11)
- [ ] `npx vitest run` (22 теста)
- [ ] `npm run typecheck`
- [ ] `npm run build`

---

## 11. Известные проблемы / нюансы

- **Ошибки lint** — исправлены (0 errors). Осталось ~73 warning'а: `@typescript-eslint/no-explicit-any` (в Prisma-репозиториях из-за рыхлой типизации libSQL-адаптера) и `@next/next/no-img-element` (`<img>` вместо `next/image`). Не критичны, чистятся по желанию
- **IMAP-парсер** в `mail.ts` — наивное извлечение HTML из сырого письма (регэксп). Для сложных multipart может дать неполный HTML. Можно улучшить через mailparser
- **XSS в просмотре письма** — ✅ закрыто: тело письма санитайзится DOMPurify (`src/shared/lib/sanitize-html.ts`), компонент `EmailBody` грузится только на клиенте (`ssr: false`). Вырезаются скрипты, формы, `<style>`, iframe, обработчики; ссылки получают `rel="noopener noreferrer"`. CSP пока не настроен
- **Публичный POST `/api/rent/requests`** — ✅ закрыто: zod-схема (`src/shared/lib/rent-request.ts`: длины, email, реальные даты, телефон или email), серверный пересчёт `days`/`total`/`deposit`/`extras`, проверка активности авто, мин/макс срока (такси — от 7 дней). Клиентские суммы игнорируются
- **Rate limit** — ✅ расширен: `/admin/login` (5/15 мин) + публичные POST `/api/rent/requests` и `/api/contact` (10/10 мин), `/api/autopodbor/leads` (5/10 мин) в `src/proxy.ts`. In-memory: для нескольких инстансов нужен Redis. IP из `x-forwarded-for`/`x-real-ip` (за nginx; при прямом доступе заголовок подделывается)
- **Автоподбор: изображения** — hero с CSS-иллюстрацией проверки и маленьким фото эксперта; сгенерированные hero/OG удалены, OG — дефолтный `/opengraph-image.jpg`; эксперт — реальное фото `/images/avatar.jpg`. MCP `imagegen` отключён (`opencode.json` → `disabled: true`)
- **Автоподбор: цены и юридика** — тарифы, гарантия, дисклеймер и `/privacy` требуют утверждения владельцем (данные из анализа рынка и ТЗ)
- **Автоподбор: сброс контента к дефолту** — в админке не реализован (опасная зона отложена); контент правится вручную/через seed
- **Автоподбор: `any` в мапперах** — `row: any` в Prisma-репозитории (как в остальных репозиториях проекта) добавляет ~13 warning'ов
- **Поиск по входящим** — простой `contains` по from/subject/textBody, без полнотекстового индекса
- **`RentCar.brand/model`** — ✅ связано через FK (`brandId`/`modelId` на `car_brands`/`car_models`), имена резолвятся через `brandRel`/`modelRel`
- **Ошибка «404 на /admin/login»** возникала из-за устаревшего кэша `.next` после рестарта. Решение: `Remove-Item .next -Recurse` + перезапуск dev
- **server-only** в `encryption.ts` — импортировать можно только из серверного кода
- **SQLite vs PostgreSQL**: для prod есть docker-compose.yml + Dockerfile, но деплой ещё не делался

---

## 12. Ключевые файлы (навигация)

| Задача | Файл |
|---|---|
| Схема БД | `prisma/schema.prisma` |
| Сид | `scripts/seed.ts` + `scripts/seed-autopodbor.ts` |
| Точка входа админки | `src/app/(dashboard)/admin/layout.tsx` → `auth-layout.tsx` |
| Авторизация | `src/lib/auth.server.ts` |
| Меню админки | `src/app/api/admin/menu/route.ts` |
| Аудит | `src/lib/audit.server.ts` |
| Рент: репо | `src/infrastructure/persistence/rent.prisma.repository.ts` |
| Рент: форма | `src/features/admin/rent/ui/rent-car-form.tsx` |
| Рент: история | `src/features/admin/rent/ui/rent-car-history-panel.tsx` |
| Рент: листинг | `src/app/(marketing)/services/rent/page.tsx` |
| Рент: деталь | `src/app/(marketing)/services/rent/[slug]/page.tsx` |
| Калькулятор: публичный | `src/app/(marketing)/services/rent/calculator/page.tsx` |
| Калькулятор: админка | `src/app/(dashboard)/admin/rent/calculator/page.tsx` |
| Калькулятор: расчёт цены | `src/shared/lib/price.ts` → `calculateRentPrice` |
| Автоподбор: лендинг | `src/app/(marketing)/services/inspection/page.tsx` + `src/features/autopodbor/ui/autopodbor-page.tsx` |
| Автоподбор: админка | `src/app/(dashboard)/admin/inspection/page.tsx` + `src/features/admin/autopodbor/ui/*` |
| Автоподбор: репо | `src/infrastructure/persistence/autopodbor.prisma.repository.ts` |
| Автоподбор: схема/zod | `src/entities/autopodbor/autopodbor.schema.ts` |
| Автоподбор: API-реестр | `src/app/api/autopodbor/_lib/registry.ts` |
| Автоподбор: заявки API | `src/app/api/autopodbor/leads/route.ts` |
| Автоподбор: сид | `scripts/seed-autopodbor.ts` |
| Автоподбор: промпты картинок | `docs/autopodbor-images-prompts.md` |
| Политика конфиденциальности | `src/app/(marketing)/privacy/page.tsx` |
| Цены | `src/shared/lib/price.ts` |
| Курс USD | `src/shared/lib/exchange-rate.ts` |
| Почта: логика | `src/shared/lib/mail.ts` |
| Почта: шифрование | `src/shared/lib/encryption.ts` |
| Почта: UI | `src/app/(dashboard)/admin/email/page.tsx` |
| Контакты: репо | `src/infrastructure/persistence/contact.prisma.repository.ts` |
| Контакты: UI админ | `src/app/(dashboard)/admin/contacts/page.tsx` |
| Контакты: публичная | `src/features/contacts/ui/contacts-view.tsx` |
| Картинки: сборка | `scripts/images-build.mjs` |
| Картинки: бриф и промпты | `docs/IMAGE-BRIEF.md` |
| Картинки: заглушка | `public/images/placeholder-car.webp` |
| Загрузка файлов | `src/app/api/upload/route.ts` |
| Заявки: репо | `src/infrastructure/persistence/contact-request.prisma.repository.ts` |
| Заявки: API | `src/app/api/contact-requests/route.ts` |
| Заявки: админка | `src/app/(dashboard)/admin/requests/page.tsx` |
| Заявки: форма | `src/features/contacts/ui/contact-form.tsx` |
| Справочники (топливо/коробка) | `src/shared/lib/car-dictionaries.ts` |
| Услуги: репо (Prisma) | `src/infrastructure/persistence/service.prisma.repository.ts` |
| Анализ конкурента | `docs/competitor-analysis.md` |
| Автоподбор: анализ рынка (30+ сайтов, цены) | `docs/autopodbor-competitor-analysis.md` |
| Автоподбор: промпт лендинга + админки | `docs/autopodbor-landing-prompt.md` |
| Автоподбор: промпты изображений | `docs/autopodbor-images-prompts.md` |
| DI | `src/di/composition-root.ts` |
| Ошибки | `src/shared/lib/errors.ts` |

---

## 13. Полезные команды

```bash
# Перезапуск dev (после prisma generate)
# 1) убить node процессы с 'next' в командной строке
# 2) удалить .next
# 3) npm run dev с DATABASE_URL

# Посмотреть структуру БД
npx prisma studio

# Добавить колонку/таблицу без потери данных
$env:DATABASE_URL="file:./data/avtoway.db"; npx prisma db push --accept-data-loss

# Сгенерировать ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```