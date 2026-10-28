# Dev Log

## 2026-10-28 — Аренда: витрина и демо-парк

- [x] **Каталог `/services/rent`** переработан: компактный hero, счётчик парка, фильтры в карточке, мобильная шторка, сортировка, сетка/список, URL-синхронизация.
- [x] **Карточки** с фото, hover-прокруткой, бейджами класса/типа/брони, ценой BYN + USD, опциями и CTA.
- [x] **Серверный рендер** каталога: авто, типы, классы, комфорт, тарифные ступени и курс НБРБ приходят из БД, а не после загрузки.
- [x] **6 демо-авто** в `scripts/seed-rent.ts`: Solaris, Rio (такси), Passat, BMW 530i, Mercedes E 200, Touran; фото в `public/uploads/rent/demo-*.jpg`, условия аренды.
- [x] **Карточка аренды**: общий полноэкранный lightbox с фото, блок похожих авто; галерея вынесена в `shared/ui/photo-lightbox-gallery.tsx`.
- [x] **Админ-форма аренды**: вкладки «Основное / Фото / Цены и аренда / Опции», фото до 40 с drag-and-drop и пачками по 4, автозаполнение названия/slug, поиск опций, подсказка USD по курсу, клиентская валидация и sticky-футер. `PhotoManager` вынесен в `shared/ui/admin/photo-manager.tsx` и используется также для продажи.
- [x] Проверки: typecheck OK, eslint 0 errors, 68 tests; страницы и sitemap 200.

## 2026-10-28 — Модуль «Продажа авто»

- [x] **БД**: `sale_cars`, `sale_requests`, связи с марками/моделями; `prisma db push` + generate без reset.
- [x] **Публичный каталог** `/services/sell`: фильтры av.by-стиля, цена USD/BYN, URL-синхронизация, мобильная шторка, grid/list, hover-просмотр фото, карточки со статусами и отчётом.
- [x] **Карточка** `/services/sell/[slug]`: галерея + lightbox, ключевые параметры, экспертный отчёт, таблица характеристик, комплектация по группам, похожие авто, sticky-цена и мобильный CTA.
- [x] **Заявки**: `buy` / `trade_in` / `sell_own`, honeypot, rate-limit, API, админ-вкладка.
- [x] **Админка** `/admin/sell`: список, быстрый статус, активность, форма, custom specs, SEO, фото до 40 пачками, drag-and-drop, порядок и главная.
- [x] **SEO**: canonical/OG, Car+Offer JSON-LD, breadcrumbs, sitemap, 6 демо-авто.
- [x] **Права**: `sell.manage` в seed, меню с badge, proxy guard, audit.
- [x] **Проверки**: typecheck OK, eslint 0 errors, 68 tests, build успешен; API create/patch/delete и заявки проверены.

## 2026-10-28 — Адаптивность, SEO и масштабируемость

- [x] **Reveal** больше не скрывает контент: без JS и для краулеров блоки видимы, с JS — только лёгкий сдвиг. Убран `opacity: 0`; добавлен `js`-класс и `prefers-reduced-motion`.
- [x] **next/image** на публичных страницах: услуги, карточка услуги, аренда, калькулятор, фотогалерея. Админ-превью (blob/локальные превью) оставлены `<img>`.
- [x] **Sitemap** стал динамическим: услуги из БД + активные авто + статические страницы; `revalidate=3600`, `lastModified`.
- [x] **Breadcrumbs UI + BreadcrumbList JSON-LD** на `/services`, `/services/[slug]`, `/services/rent`, `/services/rent/[slug]`, калькуляторе, `/about`, `/contacts`, `/privacy`, `/partners`.
- [x] **Metadata/canonical/OG** для `/services`, `/services/rent`, калькулятора, карточек услуг и авто, `/about`, `/contacts`, `/partners`.
- [x] **Видео**: пустая секция не рендерится, если YouTube API не настроен; убрано сообщение про `.env.local`.
- [x] **LCP/контраст**: eager для аватара в hero и `/about`; усилен контраст секции «О проекте»; `data-scroll-behavior="smooth"`.
- [x] **Архитектура**: `docs/architecture/scalability-crm-seo.md` — ServiceModule, единая CRM `leads`, миграция без потери данных, города/блог, интеграции, финансы, SEO-чеклист.
- [x] Проверки: typecheck OK, eslint 0 errors (77 warnings), 55 tests, build успешен; публичные страницы 200.

## 2026-10-28 — Админка: исправлен key в журнале аудита

- [x] `filtered.map` в `AdminAuditLogsPage` возвращал некейный `<>`; заменён на `<Fragment key={l.id}>`, лишние ключи у `<tr>` убраны. React warning «Each child in a list» устранён.

## 2026-10-28 — YouTube: Shorts больше не попадают в карусель

- [x] **Причина**: фильтр считал Shorts только короче 60 секунд (`>= 60`), поэтому ровно 60-секундный ролик «Как загрунтовать лонжерон изнутри» проходил как обычное видео.
- [x] **Фикс**: порог поднят до 180 секунд (Shorts — до 3 минут), 180 секунд включительно исключаются, 181+ остаются. Загрузка увеличена до 45 роликов, чтобы после фильтра в карусели было 15 длинных.
- [x] **Проверка**: тест обновлён (45/60/74/179/180 — исключены, 181/308/1200 — остаются); в HTML главной нет 60-секундного Shorts, длинные видео на месте.
- [x] **Дев-сервер** перезапущен, чтобы сбросить ISR-кеш главной.

## 2026-10-28 — Аудит: тарифы, квиз, форма, мобильное меню

- [x] **Тарифы**: убраны табы; 3 основных карточки одинаковой высоты + 3 компактные «Дополнительно». Все кнопки — «Оставить заявку». На мобиле — горизонтальный свайп, у дополнительных — сетка.
- [x] **Квиз**: вместо 4-шаговой формы — 3 карточки-задачи. Клик выбирает услугу и плавно ведёт к форме.
- [x] **Hero**: две колонки; справа CSS-панель проверки (машина, скан-линия, 24 параметра, 30 дней, маленькое фото Виктора). Без AI-фото; 3 плашки доверия, кнопки «Подобрать авто» и «Позвонить».
- [x] **Форма**: первый экран — имя, телефон, услуга; город/бюджет/авто/комментарий — в «Дополнительно»; согласие рядом с кнопкой.
- [x] **CTA-мосты**: после рисков — «Проверить авто до покупки», после проверок — «Хочу такой отчёт», после гарантий — «Получить консультацию».
- [x] **Мобильная шапка**: добавлено бургер-меню (общий `MainNav`), убран горизонтальный выезд навигации; sticky CTA — «Консультация / бесплатно».
- [x] **Sitemap**: добавлены `/services`, `/services/rent`, `/services/rent/calculator`, `/contacts`, `/privacy`.
- [x] **About**: фото на `next/image` с `priority`.
- [x] **Контент**: пересеян; 6 тарифов, 4 этапа, 24 проверки, 14 карточек, 5 FAQ, 10 секций; заявки не тронуты.

### Verification
- typecheck 0 · eslint 0 ошибок (85 warning) · 55 тестов · build успешен
- `/services/inspection` → 200; тарифы без табов, квиз 1 шаг, форма с «Дополнительно», CTA-мосты, мобильное меню
- Скриншоты: desktop 1440, mobile 390

### Осталось из аудита
- `<img>` на `/services`, `/services/rent`, `/services/rent/calculator`, галерее авто — отдельный проход (нужны remotePatterns/размеры).
- CSP, IMAP-парсер, реальный почтовый ящик, 85 warning'ов `any` — вне рамок этого редизайна.

## 2026-10-28 — Автоподбор: облегчение, без hero-фото

- [x] **Hero**: убрана правая колонка с фото и плашкой «Отчёт с фото и видео». Текст по центру, без изображения; скелетон загрузки обновлён под новый вид.
- [x] **Тарифы**: «Подбор из-за границы» убран (6 тарифов, группы «По Беларуси» и «Дополнительно»); вариант «Пригнать из-за границы» убран из квиза.
- [x] **Короче**: 4 этапа вместо 5, 24 проверки вместо 30, 5 FAQ вместо 6; блок «Работаем по Беларуси» убран (города остались в форме).
- [x] **Фото**: `imagegen` снова отключён, сгенерированные hero/OG удалены; OG — дефолтный `/opengraph-image.jpg`, эксперт — реальное фото `/images/avatar.jpg`.
- [x] **Админка**: из «Контента» убраны поля hero-изображения и OG; остальные настройки на месте.
- [x] **БД**: контент автоподбора пересеян; заявки не тронуты.

### Verification
- typecheck 0 · eslint 0 ошибок · 55 тестов · build успешен
- `/services/inspection` → 200; 6 тарифов, 4 этапа, 24 проверки, 5 FAQ, 9 видимых секций; нет «из-за границы», hero-фото и плашки «Отчёт с фото и видео»
- Скриншоты 1440px: центрированный hero + вся страница

## 2026-10-27 — Автоподбор: короче, чище, с фото

- [x] **Тексты сокращены**: H1 «Живое авто, а не картинка», короткие подзаголовки, 4 риска, 5 этапов, 30 проверок, 6 FAQ, 7 тарифов. Убраны trust-bar, пример отчёта, кейсы, демо-контент.
- [x] **Беларусь**: «ОСАГО» заменено на «автогражданка» (проверки + docs), остальные термины (ГАИ, техпаспорт, МКАД) корректны.
- [x] **Фото**: hero сгенерирован через Pollinations FLUX и обрезан (убраны фигура и водяной знак), OG собран из него, эксперт — реальное фото `/images/avatar.jpg`. MCP `imagegen` включён, добавлен провайдер `pollinations-flux` (сейчас требует pollen key/оплату).
- [x] **Надёжность**: убраны Reveal-обёртки с лендинга — заголовки и карточки видны сразу, без JS-анимации.
- [x] **Админка**: «Доказательства» → только отзывы и FAQ; в контенте убрана неиспользуемая статистика, оставлена гарантия; бюджет в статистике считается по `budgetTo`, если `budgetFrom` пуст.
- [x] **Проверки**: контент в БД сброшен и пересеян (7 тарифов, 30 проверок, 11 секций); заявки не тронуты.

### Verification
- typecheck 0 ошибок · eslint 0 ошибок · build успешен
- Лендинг: 1 H1, 10 видимых секций, нет «ОСАГО», «100+», «Пример отчёта», «Кейсы»; hero/OG/avatar отдаются
- Проверено скриншотами 1440px (hero + полная страница)

## 2026-10-27 — Автоподбор: лендинг + админка

- [x] **Prisma**: 13 моделей `autopodbor_*` (settings/sections/tariffs/steps/features/checks/cases/reviews/faq/gallery/cities/promos/leads) + связь лида с `User` (ответственный)
- [x] **Entities**: типы, zod-схемы (заявка + 11 сущностей), интерфейс репозитория, Prisma-репозиторий, DI
- [x] **Seed**: настройки, 14 секций, 9 тарифов, 7 этапов, 48 проверок, 21 карточка (риски/преимущества/гарантии/trust), 10 FAQ, 18 городов. Отзывы не выдумываются, демо-кейс скрыт
- [x] **Публичный API**: `GET /api/autopodbor` (кэш 5 мин), `POST /api/autopodbor/leads` — zod, honeypot, rate limit 5/10 мин, название/цена услуги из БД
- [x] **Лендинг** `/services/inspection`: hero (фолбэк без AI-картинки), trust-bar, квиз 4 шага, риски, тарифы с табами, этапы, 48 проверок, пример отчёта, кейсы, гарантии, эксперт, отзывы, география, FAQ, форма, sticky CTA
- [x] **SEO**: метаданные из БД (absolute title, canonical, robots/noindex, OG), JSON-LD (Service+Offer, FAQPage, BreadcrumbList), sitemap
- [x] **Админка** `/admin/inspection` (7 вкладок): Обзор (статистика + график 14 дней), Контент (настройки + заголовки секций), Тарифы с превью, Как работаем (6 подтабов), Доказательства (4 подтаба), Заявки (фильтры/статусы/ответственный/заметки/CSV), Настройки
- [x] **Интеграция**: пункт меню «Автоподбор» с badge, права `autopodbor.*`, guard в `proxy.ts`, аудит, категория `autopodbor` для upload
- [x] **Юридика**: страница `/privacy`, ссылка из форм, дисклеймер из настроек
- [x] Изображения не генерировались (MCP `imagegen` отключён) — пути hero/OG прописаны, есть фолбэки

### Verification
- typecheck: 0 ошибок · eslint: 0 ошибок · 55 тестов · build успешен (`/services/inspection` — ISR 5m)
- Живая проверка: лендинг 200 (1 H1, тарифы, 48 проверок, FAQ, JSON-LD, Telegram); заявка valid → 201, honeypot → 201 без записи, без согласия → 400, без авторизации API → 401
- Админка: `/admin/inspection` 200, статистика/тарифы/лиды/сотрудники доступны, меню с badge, CRUD тарифа (create → update → delete) работает
- Тестовые заявки и тариф удалены; в БД 9 тарифов, 0 заявок

## 2026-10-27 — Telegram в контактах

- [x] Контакт `telegram` обновлён на `https://t.me/avtoway_by` (БД + seed)
- [x] Footer «Мы в сети» и блок «Мои ресурсы» на `/about` — добавлен Telegram (новая иконка `IconTelegram`)
- [x] Нормализация ссылки: `telegramUrl()` / `telegramHandle()` в `src/shared/lib/social.ts` (URL или `@handle`); карточка авто показывает `@avtoway_by`
- [x] JSON-LD `Organization.sameAs` включает Telegram; сериализация JSON-LD экранирует `<`

### Verification
- typecheck · eslint 0 ошибок · 55 тестов
- `/`, `/about`, `/contacts` содержат `t.me/avtoway_by`; JSON-LD — `sameAs` с Telegram

## 2026-10-27 — Безопасность: XSS почты, валидация заявок, rate limit, единые названия типов

- [x] **XSS в `/admin/email`**: тело письма санитайзится DOMPurify (`src/shared/lib/sanitize-html.ts`), рендер через `EmailBody` с `ssr: false`. Вырезаются script/form/style/iframe/обработчики, ссылки — `rel="noopener noreferrer"`. 4 теста
- [x] **Валидация заявки**: zod-схема `src/shared/lib/rent-request.ts` (имя ≤100, телефон/email, формат email, реальные даты, ≤20 опций, телефон ИЛИ email)
- [x] **Серверный пересчёт**: `/api/rent/requests` считает дни, сумму по ступеням, опции и залог сам; клиентские `total`/`deposit`/`message` игнорируются. Проверка активности авто и мин/макс срока (такси — от 7 дней)
- [x] **Rate limit**: `checkRateLimit(key, max, window)`; в `src/proxy.ts` — логин 5/15 мин + публичные POST `/api/rent/requests` и `/api/contact` 10/10 мин на IP
- [x] **Единый источник названий типов**: БД (`rent_types.name`) = «Для личных целей» / «Под такси»; seed обновляет старые названия, хардкод `RENT_TYPE_LABEL` удалён
- [x] **UX**: телефон или email обязательны (подсказка в форме), фильтры коробки/топлива/класса показывают только то, что есть в парке, убран дублирующий select «Тип аренды» из сайдбара
- [x] Тесты: 55 (было 51) — `rent-request`, `sanitize-html`, кастомные лимиты

### Verification
- typecheck: 0 ошибок · eslint: 0 ошибок · 55 тестов · build успешен
- Живая проверка API: поддельный `total:1` → сервер вернул 360 BYN; без контакта → 400; несуществующее авто → 404; такси 3 дня → 400, 8 дней → 1000 BYN; 12 POST на `/api/contact` → 10×201 + 2×429
- Страницы `/services/rent`, `/services/rent/calculator`, `/admin/email` → 200; API типов отдаёт «Для личных целей» / «Под такси»

## 2026-10-27 — Аудит фильтра аренды: исправления

- [x] Калькулятор: выбранное авто берётся только из отфильтрованного списка — нельзя отправить заявку на «невидимую» машину после смены фильтра
- [x] Калькулятор: `maxDays` теперь блокирует отправку (раньше была только подсказка), добавлена ошибка отправки заявки (раньше при сбое кнопка просто гасла)
- [x] Листинг: фильтр цены сравнивает цену за сутки и для такси (`priceDayTaxi` или `price7Days / 7`), раньше такси исключалось/проходило как 0
- [x] Листинг: счётчики на чипах учитывают остальные фильтры (класс/цена/коробка/топливо/места/комфорт), «Все авто» показывает столько же
- [x] Листинг: «скидки от 3 суток» больше не хардкод — берётся первая ступень со скидкой из `/api/rent/pricing-tiers`
- [x] Листинг: USD-цена такси подписана `/нед`, чипы не мигают «(0)» во время загрузки
- [x] Доступность: у чипов `type="button"` и `aria-pressed`
- [x] Убраны мёртвые поля `price3Days` / `priceMonth` из интерфейса (в схеме их уже нет)
- [x] Детальная страница: бейдж типа тоже через `rentTypeLabel()` — «Для личных целей» вместо «Аренда»

### Verification
- typecheck: 0 ошибок · eslint: 0 ошибок · 36 тестов · `/services/rent` и `/services/rent/calculator`: 200

## 2026-10-27 — Фильтр по типу аренды

- [x] Быстрые чипы «Все авто / Для личных целей / Под такси» с количеством — в публичном листинге `/services/rent`
- [x] Тот же фильтр в калькуляторе `/services/rent/calculator` (типы берутся из `/api/rent?types=true`)
- [x] Подписи типов в UI через `RENT_TYPE_LABEL` / `rentTypeLabel()` вместо сырых названий из БД
- [x] Бейдж на карточке авто показывает «Для личных целей» / «Под такси»

### Verification
- typecheck: 0 ошибок · lint: 0 ошибок · страницы `/services/rent` и `/services/rent/calculator`: 200

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
