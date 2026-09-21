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
| Тесты | Vitest 4 (26 тестов) |
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
| CarBrand | car_brands | Марки авто |
| CarModel | car_models | Модели авто |
| Fuel | fuels | Типы топлива (7, как на av.by) |
| Transmission | transmissions | Коробки передач (4) |
| ComfortFeature | comfort_features | Опции комфорта (14) |
| Contact | contacts | Контактная информация сайта (singleton) |
| SentEmail | sent_emails | Отправленные письма |
| InboxEmail | inbox_emails | Входящие письма (кеш из IMAP) |

### Ключевые поля RentCar
`name, slug, brand, model, year, color, transmission, fuel, engineVolume, seats, features (CSV строка), photos (CSV), mainPhoto, description, priceDay, price3Days, price7Days, priceMonth, priceDayTaxi, rentTypeId, isActive, bookedUntil, sortOrder`

Цены зависят от типа аренды:
- **Аренда** (rent): цена за день / 3 дня / 7 дней / месяц
- **Под такси** (taxi): за неделю (price7Days) + среднее за день (priceDayTaxi)

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
- **Публичный листинг `/services/rent`**: фильтры слева (тип, цена, коробка, топливо, места, комфорт), горизонтальные карточки со ВСЕМИ ценами + USD-эквивалент
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
- `/contacts` (см. выше)
- Редиректы: `/rent`, `/sell`, `/inspection` → `/services`

---

## 6. Технические решения и паттерны

### DI-контейнер
`src/di/container.ts` + `src/di/composition-root.ts`. Репозитории регистрируются и достаются через `container.get<T>("Token")`. В dev используются memory-репозитории для некоторых сущностей, в prod — Prisma. **ВАЖНО:** API-роуты импортируют `@/di/composition-root` в начале.

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
npm run dev            # http://localhost:3000
npm run lint
npx vitest run
npm run build && npm run start
```

Админка: `/admin/login`, вход **admin / admin123** (сменить после входа!).

### Seed создаёт
Админа, роли, типы аренды (Аренда, Под такси), 7 видов топлива, 4 коробки, ~25 марок авто + модели, 14 опций комфорта, контактную строку, SMTP-настройки-заглушки.

---

## 8. Текущее состояние (важно!)

1. **Рабочее дерево чистое** — всё закоммичено в `dev` и запушено
2. **Почта НЕ подключена к реальному ящику** — SMTP/IMAP настроены как тест. Пользователь планировал привязать временно свой Gmail (нужен пароль приложения), потом `info@avtoway.by` (создать в cPanel на hoster.by)
3. **Хостинг**: общий cPanel на hoster.by НЕ подходит для этого проекта (нужен Node.js + PostgreSQL + фоновые процессы). Решение — VPS hoster.by (~70-105 BYN/мес) или Hetzner (~€4-8/мес). Покупать ПОСЛЕ завершения сайта
4. **Домен** `avtoway.by` оплачен до 13.02.2027 — продлевать обязательно, это главный актив
5. **В remote URL git был зашит GitHub-токен** (`ghp_...`). Я убрал его из URL после пуша. Рекомендация пользователю: отозвать старый токен на GitHub, создать новый. При пуше авторизоваться через токен/gh

---

## 9. План — что делать дальше (по приоритету)

### Сейчас / ближайшее
1. **Подключить почту**: привязать Gmail временно (пароль приложения) → проверить отправку/получение/ответы/поиск. Потом создать `info@avtoway.by` в cPanel и переключить (хост `mail.avtoway.by`)
2. **Протестировать модуль аренды** (список в §10 ниже)
3. **Сменить пароль админа** в боевом окружении

### Среднесрочно (дор. карта в AGENTS.md)
4. **CRM для заявок** из Telegram/Instagram/Viber/WhatsApp: заявки на свой сервер, ответ через админку, единая лента, история переписки, назначение ответственного
5. **Финансовый учёт**: приход/расход по каждой услуге, налоги, прибыль, интеграция с RentCarHistory
6. **Почта**: цепочки писем, шаблоны
7. **Остальные услуги**: продажа, автоподбор, эвакуатор, пригон, таксопарк, СТО, детейлинг (по roadmap.md)

### Долгосрочно
8. VPS + деплой, интеграция av.by API, мобильное приложение (API должен работать и для мобилок)

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

### Контакты `/admin/contacts` + `/contacts`
- [ ] Кнопка «Редактировать» → изменить → сохранить
- [ ] Изменения видны: футер, `/about`, карточка авто, `/contacts`

### Общее
- [ ] `npm run lint`
- [ ] `npx vitest run` (26 тестов)

---

## 11. Известные проблемы / нюансы

- **Ошибки lint**: есть pre-existing ошибки (unused vars, `<a>` вместо `<Link>`, setState in effect) — не критичны, но почистить желательно
- **IMAP-парсер** в `mail.ts` — наивное извлечение HTML из сырого письма (регэксп). Для сложных multipart может дать неполный HTML. Можно улучшить через mailparser
- **Поиск по входящим** — простой `contains` по from/subject/textBody, без полнотекстового индекса
- **Ошибка «404 на /admin/login»** возникала из-за устаревшего кэша `.next` после рестарта. Решение: `Remove-Item .next -Recurse` + перезапуск dev
- **server-only** в `encryption.ts` — импортировать можно только из серверного кода
- **SQLite vs PostgreSQL**: для prod есть docker-compose.yml + Dockerfile, но деплой ещё не делался

---

## 12. Ключевые файлы (навигация)

| Задача | Файл |
|---|---|
| Схема БД | `prisma/schema.prisma` |
| Сид | `scripts/seed.ts` |
| Точка входа админки | `src/app/(dashboard)/admin/layout.tsx` → `auth-layout.tsx` |
| Авторизация | `src/lib/auth.server.ts` |
| Меню админки | `src/app/api/admin/menu/route.ts` |
| Аудит | `src/lib/audit.server.ts` |
| Рент: репо | `src/infrastructure/persistence/rent.prisma.repository.ts` |
| Рент: форма | `src/features/admin/rent/ui/rent-car-form.tsx` |
| Рент: история | `src/features/admin/rent/ui/rent-car-history-panel.tsx` |
| Рент: листинг | `src/app/(marketing)/services/rent/page.tsx` |
| Рент: деталь | `src/app/(marketing)/services/rent/[slug]/page.tsx` |
| Цены | `src/shared/lib/price.ts` |
| Курс USD | `src/shared/lib/exchange-rate.ts` |
| Почта: логика | `src/shared/lib/mail.ts` |
| Почта: шифрование | `src/shared/lib/encryption.ts` |
| Почта: UI | `src/app/(dashboard)/admin/email/page.tsx` |
| Контакты: репо | `src/infrastructure/persistence/contact.prisma.repository.ts` |
| Контакты: UI админ | `src/app/(dashboard)/admin/contacts/page.tsx` |
| Контакты: публичная | `src/features/contacts/ui/contacts-view.tsx` |
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