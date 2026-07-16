# План рефакторинга АВТОWAY — v1.0-beta → v2.0

> Составлен: 15.07.2026 | Основан на анализе кодовой базы, БД и roadmap

---

## Текущее состояние (срез)

| Аспект | Статус | Проблема |
|--------|--------|----------|
| БД для users/roles/audit | SQLite через `@libsql/client`, raw SQL | Схема создаётся в коде, миграции — ALTER TABLE на лету |
| БД для services/partners | Memory-репозитории (dev), Prisma (prod) | Prisma установлен, но **нет `schema.prisma`**, Prisma репозитории нерабочие |
| ORM | Отсутствует | Raw SQL для users/roles, нет type-safety |
| docker-compose | PostgreSQL 16, порт 5432 | Определён, но не используется приложением |
| Админ-панель | Монолитные page.tsx (200-600+ строк) | Вся логика в одном файле: fetch + state + форма + UI |
| Аутентификация | Самописный SHA-256 токен в cookie | Нестандартный механизм, нет refresh-токенов |
| Тесты | 16 unit-тестов (value objects + rate-limiter) | Нет тестов API, компонентов, интеграционных |
| Marketing-страницы | Server Components + Suspense + ISR | ✅ Хорошо |
| YouTube-фича | Zod-валидация, DI, фильтры, мапперы | ✅ Хорошо |
| Структура папок | Feature-Sliced + DDD-lite | ✅ Хорошо |

---

## Стратегия рефакторинга: 4 фазы

```
Фаза 1 (2-3 дня)    ───   Консолидация БД и Prisma
Фаза 2 (2-3 дня)    ───   Единая архитектура API
Фаза 3 (2-3 дня)    ───   Декомпозиция админ-панели
Фаза 4 (1-2 дня)    ───   Качество и production-readiness
```

---

## Фаза 1 — Консолидация БД и Prisma 🗄️

### 1.1 Создать Prisma Schema

**Проблема:** Prisma установлен, но файл `prisma/schema.prisma` отсутствует. Репозитории `PrismaServiceRepository` и `PrismaPartnerRepository` написаны, но не могут работать без схемы. Package.json ссылается на `prisma/seed.ts`, которого нет.

**Решение:**
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // dev
  // provider = "postgresql"  // prod — через DATABASE_URL
  url = env("DATABASE_URL")
}

model User {
  id         String      @id @default(uuid())
  login      String      @unique
  password   String
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")
  profile    Profile?
  roles      UserRole[]
  auditLogs  AuditLog[]

  @@map("users")
}

model Profile {
  id           String   @id @default(uuid())
  userId       String   @unique @map("user_id")
  name         String   @default("")
  email        String?
  phone        String?
  photo        String?
  position     String?
  birthDate    String?  @map("birth_date")
  telegram     String?
  workSchedule String?  @default("full_time") @map("work_schedule")
  hireDate     String?  @map("hire_date")
  bio          String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique
  description String?
  level       Int              @default(0)
  permissions RolePermission[]
  users       UserRole[]

  @@map("roles")
}

model RolePermission {
  roleId     String @map("role_id")
  permission String
  role       Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([roleId, permission])
  @@map("role_permissions")
}

model UserRole {
  userId String @map("user_id")
  roleId String @map("role_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@map("user_roles")
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String
  entity    String
  entityId  String   @map("entity_id")
  details   String?  // JSON
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}

model Service {
  id          String  @id @default(uuid())
  slug        String  @unique
  title       String
  subtitle    String?
  description String?
  icon        String  @default("car")
  color       String  @default("#E74C3C")
  isActive    Boolean @default(true) @map("is_active")
  sortOrder   Int     @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("services")
}

model Partner {
  id            String  @id @default(uuid())
  name          String
  logo          String?
  website       String?
  description   String?
  phone         String?
  email         String?
  address       String?
  contactPerson String?  @map("contact_person")
  isActive      Boolean @default(true) @map("is_active")
  sortOrder     Int     @default(0) @map("sort_order")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("partners")
}

model PartnerSocial {
  id        String  @id @default(uuid())
  partnerId String  @map("partner_id")
  platform  String  // youtube, instagram, telegram, etc.
  url       String
  partner   Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@map("partner_socials")
}

model PartnerPhoto {
  id        String  @id @default(uuid())
  partnerId String  @map("partner_id")
  path      String
  alt       String?
  sortOrder Int     @default(0) @map("sort_order")
  partner   Partner @relation(fields: [partnerId], references: [id], onDelete: Cascade)

  @@map("partner_photos")
}

model Setting {
  id    String @id @default(uuid())
  key   String @unique
  value String

  @@map("settings")
}
```

### 1.2 Создать миграции

```bash
npm run db:generate    # prisma generate
npm run db:migrate:dev # prisma migrate dev --name init
```

### 1.3 Мигрировать данные из SQLite в Prisma

- Написать скрипт `scripts/migrate-to-prisma.ts`
- Перенести users, profiles, roles, role_permissions, user_roles, audit_logs
- Сохранить `data/avtoway.db` как резервную копию

### 1.4 Удалить `src/lib/db.server.ts`

- Заменить все импорты `db` на Prisma Client
- Service/Partner репозитории уже готовы (требуют только работающий PrismaClient)

### 1.5 Создать UserRepository

- Сейчас user/role API используют raw SQL напрямую
- Создать `entities/user/user.repository.ts` + Prisma-реализацию
- Аналогично для AuditLog

### 1.6 Итог Фазы 1

| Было | Стало |
|------|-------|
| Raw SQL в `db.server.ts` | Prisma Schema + миграции |
| Inline ALTER TABLE миграции | Prisma Migrate (версионированные) |
| `@libsql/client` | Только Prisma (SQLite adapter для dev, PostgreSQL для prod) |
| Memory-репозитории в dev | Prisma-репозитории для всех окружений |
| БД в `data/avtoway.db` | БД в `prisma/dev.db` (SQLite) / PostgreSQL (prod) |

---

## Фаза 2 — Единая архитектура API 🔌

### 2.1 Создать UserRepository + AuditLogRepository

```
entities/user/
  user.ts              — User domain type
  user.repository.ts   — UserRepository interface
infrastructure/persistence/
  user.prisma.repository.ts  — Prisma implementation
di/composition-root.ts       — регистрация
```

**Методы:**
```typescript
interface UserRepository {
  getAll(): Promise<UserWithRoles[]>
  getById(id: string): Promise<UserWithRoles | null>
  getByLogin(login: string): Promise<UserWithAuth | null>
  create(data: CreateUserInput): Promise<User>
  update(id: string, data: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>
  updatePassword(id: string, hash: string): Promise<void>
  assignRoles(userId: string, roleIds: string[]): Promise<void>
}
```

### 2.2 Создать RoleRepository

```
entities/role/
  role.ts              — Role domain type
  role.repository.ts   — RoleRepository interface
infrastructure/persistence/
  role.prisma.repository.ts
```

### 2.3 Рефакторинг API routes

**Текущая проблема:** Роуты напрямую работают с `db`:
```typescript
// src/app/api/users/route.ts (сейчас)
import { db } from "@/lib/db.server";
// ... raw SQL запросы
```

**Целевое состояние:**
```typescript
// src/app/api/users/route.ts (после)
import { container } from "@/di/container";
const userRepo = container.get<UserRepository>("UserRepository");
const users = await userRepo.getAll();
```

Заменить во всех API routes:
- `api/users/**` → `UserRepository`
- `api/roles/**` → `RoleRepository`
- `api/auth/**` → `UserRepository` + сервис аутентификации
- `api/audit-logs/**` → `AuditLogRepository`

### 2.4 Сервисный слой для аутентификации

Выделить `src/lib/auth.server.ts` в `features/auth/`:

```
features/auth/
  auth.service.ts      — login, verifyToken, getCurrentUser, hasPermission
  auth.errors.ts       — AuthError, InvalidCredentialsError, etc.
  auth.middleware.ts   — withAuth, withPermission (для API routes)
```

### 2.5 Итог Фазы 2

| Было | Стало |
|------|-------|
| Raw SQL в API routes | Prisma через Repository |
| Нет юнит-тестов для API | Mock Repository → тестируемые API routes |
| `lib/auth.server.ts` монолит | `features/auth/` модуль с DI |
| `lib/audit.server.ts` монолит | `AuditLogRepository` + `AuditService` |

---

## Фаза 3 — Декомпозиция админ-панели 🧩

### 3.1 Проблема

Админ-страницы — это огромные файлы (200-600+ строк), внутри которых:
- Состояние (useState для формы, списков, модалок, валидации)
- Fetch-логика (useEffect → fetch → setState)
- Формы (десятки полей ввода)
- CRUD-операции (создание, редактирование, удаление)
- UI-отрисовка (таблицы, модальные окна, карточки)

Всё в одном `"use client"` файле. Невозможно тестировать, сложно поддерживать.

### 3.2 Решение: разделить каждый CRUD-раздел на компоненты

```
features/admin/
  users/
    users-page.tsx           — серверный компонент (fetch данных)
    users-page.client.tsx    — клиентский компонент (состояние, действия)
    ui/
      users-table.tsx        — таблица пользователей
      user-form-modal.tsx    — модалка создания/редактирования
      user-form.tsx          — форма с полями
      user-delete-dialog.tsx — диалог подтверждения удаления
      user-roles-select.tsx  — выбор ролей
      user-filters.tsx       — фильтры/поиск
    users.actions.ts         — Server Actions (createUser, updateUser, deleteUser)
    users.hooks.ts           — кастомные хуки (useUsers, useUserForm)
  services/
    ...аналогично
  partners/
    ...аналогично
  roles/
    ...аналогично
  audit-logs/
    ...аналогично
  dashboard/
    ...аналогично
  layout/
    sidebar.tsx              (из shared/ui/admin/)
    breadcrumbs.tsx
    auth-guard.tsx
```

### 3.3 Переход на Server Actions

**Сейчас:** API routes через `fetch()` из клиентского компонента.
**После:** Server Actions с прогрессивным улучшением (no-JS fallback).

```typescript
// features/admin/users/users.actions.ts
"use server";

import { container } from "@/di/container";
import { createAuditLog } from "@/features/audit/audit.service";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const userRepo = container.get<UserRepository>("UserRepository");
  // ... валидация, создание, аудит
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  // ...
}
```

### 3.4 Итог Фазы 3

| Было | Стало |
|------|-------|
| Монолитный page.tsx (200-600 строк) | 5-7 компонентов по 30-80 строк |
| fetch API routes из клиента | Server Actions |
| Состояние в useState | Хуки + React Query / SWR (опционально) |
| Нельзя тестировать по частям | Каждый компонент тестируется изолированно |

---

## Фаза 4 — Качество и production-readiness ✅

### 4.1 Тестирование

**Сейчас:** 16 unit-тестов для value objects, filters, rate-limiter.

**Добавить:**

| Тип | Количество | Что покрыть |
|-----|-----------|-------------|
| Repository tests (Prisma/SQLite in-memory) | ~20 | UserRepository, RoleRepository, ServiceRepository, PartnerRepository |
| API route tests | ~15 | Все CRUD endpoints с мок-репозиториями |
| Auth service tests | ~8 | Login, token, permissions |
| Component tests | ~10 | Admin формы, модалки, таблицы |
| E2E (Playwright) | ~5 | Login → CRUD users → logout |

**Настройка тестовой БД:**
```typescript
// vitest.config.ts — добавить
globalSetup: "./tests/setup.ts",  // создание тестовой БД
```

### 4.2 Валидация на всех слоях

**Сейчас:** Zod только для YouTube API и env. Остальное — без валидации.

**Добавить:**
- `features/admin/**/*.schemas.ts` — Zod-схемы для всех форм
- `entities/**/*.schemas.ts` — Zod-схемы для доменных объектов
- Валидация в API routes (уже частично есть) и Server Actions

### 4.3 Обработка ошибок

**Сейчас:** `console.error` в некоторых местах, несистемная обработка.

**Добавить:**
- `shared/lib/errors.ts` — иерархия ошибок (AppError → ValidationError, AuthError, NotFoundError)
- `shared/api/error-handler.ts` — единый обработчик для API routes
- Error boundary компоненты с восстановлением

### 4.4 Логирование

**Сейчас:** `logger.ts` есть, но используется непоследовательно.

**Улучшить:**
- Добавить request ID (traceId) через middleware → AsyncLocalStorage
- Логировать все API-запросы (duration, status, userId)
- Логировать все Prisma-запросы в режиме отладки

### 4.5 Фиксы и технический долг

| Задача | Файл | Описание |
|--------|------|----------|
| Переименовать `proxy.ts` → `middleware.ts` | `src/proxy.ts` | Неправильное имя файла |
| Удалить дубликат `app/proxy.ts` | `src/app/proxy.ts` | Проверить, не дубликат ли |
| Починить скрипт `db:seed` | `package.json` | Сейчас ссылается на `prisma/seed.ts`, файл в `scripts/seed.ts` |
| Удалить `data/` после миграции | `data/avtoway.db` | После перехода на Prisma |
| Починить `docker-compose` | `docker-compose.yml` | Или активировать PostgreSQL, или документировать что он пока не используется |
| Добавить `prisma/` в `.gitignore` | `.gitignore` | Запись `/src/generated/prisma` уже есть, проверить |
| Убрать `src/lib/` после миграции | `src/lib/` | Перенести всё в DI/features |

### 4.6 Итог Фазы 4

| Было | Стало |
|------|-------|
| 16 тестов | 50+ тестов (unit + integration + component) |
| Нет валидации форм | Zod-схемы на всех слоях |
| Разрозненная обработка ошибок | Единая иерархия ошибок |
| Несистемное логирование | Структурированное логирование с traceId |
| `proxy.ts` | `middleware.ts` |
| `lib/` (сырой слой) | `features/` + `infrastructure/` (архитектурные слои) |

---

## Итоговый план (порядок выполнения)

```
Фаза 1 ✅  Фаза 2 ✅  Фаза 3 ✅  Фаза 4 ✅  Фаза 5 🟡
(БД)       (API)       (UI)       (тесты)    (качество)
```

### Карта миграции кода

```
УДАЛИТЬ:
  src/lib/db.server.ts           → Prisma Schema
  src/lib/audit.server.ts        → features/audit/
  src/app/proxy.ts               → src/middleware.ts
  data/avtoway.db                → prisma/dev.db

ПЕРЕМЕСТИТЬ:
  src/lib/auth.server.ts         → features/auth/
  src/proxy.ts                   → src/middleware.ts
  shared/ui/admin/*              → features/admin/layout/

РЕФАКТОРИТЬ:
  api/users/**                   → UserRepository + валидация
  api/roles/**                   → RoleRepository + валидация
  api/auth/**                    → AuthService из DI
  (dashboard)/admin/*/page.tsx   → features/admin/*/

ДОБАВИТЬ:
  prisma/schema.prisma           → полная схема БД
  prisma/migrations/             → версионированные миграции
  entities/user/                 → User домен + репозиторий
  entities/role/                 → Role домен + репозиторий
  features/auth/                 → сервис аутентификации
  features/admin/*/              → декомпозированные компоненты
  tests/                         → API, компонентные, интеграционные тесты
```

---

## Риски

| Риск | Вероятность | Меры |
|------|-------------|------|
| Потеря данных при миграции SQLite → Prisma | Низкая | Сделать бэкап `data/avtoway.db`, написать тест миграции |
| Prisma не запускается с `@libsql/client` | Средняя | Проверить совместимость версий, иметь fallback на чистый SQLite |
| Server Actions ломают админ-панель | Средняя | Сохранить старые API routes до полной проверки |
| Раздувание кода от декомпозиции | Низкая | Строгие правила: 1 компонент = 1 файл, макс. 150 строк |

---

## ✅ Статус выполнения

### Фаза 1 — Консолидация БД и Prisma ✅
- [x] prisma/schema.prisma — полная схема (10 моделей)
- [x] prisma/migrations/ — 2 миграции
- [x] prisma.config.ts — конфиг Prisma 7
- [x] prisma.client.ts — PrismaClient + libSQL adapter
- [x] UserRepository + RoleRepository + AuditLogRepository
- [x] DI composition-root — все репозитории зарегистрированы
- [x] `lib/db.server.ts` — удалён (libsql больше не используется)

### Фаза 2 — Единая архитектура API ✅
- [x] Auth сервис переписан на Prisma (loadUser, verifyLogin, getAuthUser)
- [x] Audit сервис переписан на AuditLogRepository
- [x] API routes (users, roles, audit) — мигрированы на репозитории
- [x] Admin menu route — больше не использует raw SQL

### Фаза 3 — Декомпозиция админ-панели ✅
- [x] `users/[id]/page.tsx` — разбит на ProfileView, ProfileForm, PasswordSection
- [x] `partners/page.tsx` — разбит на PartnerCard, PartnerForm, AlbumUpload
- [x] `roles/page.tsx` — RoleForm вынесен
- [x] `services/page.tsx` — ServiceForm вынесен
- [x] `users/page.tsx` — CreateUserForm вынесен
- [x] `audit-logs/page.tsx` — AuditFilters вынесен, slate theme

### Фаза 4 — Тестирование ✅
- [x] Auth service тесты (hasPermission, verifyToken, signToken) — 5 тестов
- [x] UI компонент тесты (ProfileView, MultiSelect, PasswordSection) — 3 теста
- [x] AuditLogRepository — тест методов — 2 теста
- [x] Allure report — настроен, `npm run test:report` генерирует HTML отчёт
- [x] 26 тестов, 7 файлов — все проходят
- [ ] API route тесты (CRUD с mock — запланировано)
- [ ] Интеграционные тесты (полный флоу — запланировано)

### Фаза 5 — Качество и production-readiness (частично)
- [x] Линтинг — 0 errors, 29 warnings
- [x] `db:seed` скрипт — починен (`tsx scripts/seed.ts`)
- [x] `proxy.ts` — оставлен (Next.js 16 требует proxy, не middleware)
- [ ] Zod-схемы для всех форм
- [ ] Единая иерархия ошибок (AppError → ValidationError, AuthError)
- [ ] Error boundary компоненты
- [ ] GitHub Actions CI (автоматический запуск тестов при пуше)
- [ ] Docker Compose / PostgreSQL (для продакшен-деплоя)

## Чек-лист закрытия рефакторинга

- [x] `npm run typecheck` — 0 errors
- [x] `npm test` — 26 тестов, все зелёные
- [x] `npm run build` — успешная сборка
- [x] Админ-панель: логин → CRUD всех сущностей
- [x] Prisma schema + миграции
- [x] Allure-report генерируется
- [ ] `npm run lint` — 0 errors
- [ ] `npm run dev` — проверить локально
- [ ] Главная: видео, услуги, навигация
- [ ] Все сервисные страницы: /rent, /sell, /inspection
- [ ] Docker Compose / PostgreSQL
- [ ] GitHub Actions CI
- [ ] Документация обновлена (ARCHITECTURE.md, README.md)
