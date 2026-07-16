# Чек-лист рефакторинга АВТОWAY — v1.0-beta → v2.0

> Все три волны рефакторинга. Статус на 14.07.2026.

## Волна 1 — Базовая архитектура

### 1.1 Архитектура и структура папок
- [x] 1.1.1 Route group `(dashboard)/` для админки
- [x] 1.1.2 Компоненты из `components/` → `shared/ui/`
- [x] 1.1.3 AnimatedCounter, Particles в `shared/ui/`
- [x] 1.1.4 Папка `features/` для бизнес-фич
- [x] 1.1.5 `features/home/ui/` — секции главной
- [x] 1.1.6 `features/about/ui/` — секции about
- [x] 1.1.7 `features/youtube/` — YouTube как фича
- [x] 1.1.8 `infrastructure/persistence/` — реализации репозиториев
- [x] 1.1.9 MemoryServiceRepository → `infrastructure/persistence/`
- [x] 1.1.10 `src/app/api/` — API routes

### 1.2 Компоненты
- [x] 2.1.1 Разбить `home-page.tsx` на секции
- [x] 2.1.2 `hero-section.tsx` из home-page
- [x] 2.1.3 `about-section.tsx` из home-page
- [x] 2.1.4 `video-section.tsx` из home-page
- [x] 2.1.5 `home-page.data.ts` — данные отдельно от UI
- [x] 2.1.6 `ServiceCard` в `shared/ui/`
- [x] 2.1.7 `SectionWrapper` в `shared/ui/`
- [x] 2.1.8 Хук `useColorReveal`
- [x] 2.1.9 Разбить `about/page.tsx` на 5 секций
- [x] 2.1.10 Убрать "use client" с `site-logo.tsx`
- [x] 2.1.11 Убрать "use client" с `main-nav.tsx`
- [x] 2.1.12 Убрать "use client" с `particles.tsx`
- [x] 2.1.13 Удалён дубликат `src/lib/use-in-view.ts`
- [x] 2.1.14 Реестр иконок `shared/config/icons-map.ts`

### 1.3 API и сервисный слой
- [x] 3.1 `VideoSource` абстракция
- [x] 3.2 Доменный тип `Video`
- [x] 3.3 `YouTubeVideoSource` реализация
- [x] 3.4 Миграция `youtube.ts` на `env.server.ts`
- [x] 3.5-3.8 Разделение на слои: api, mapper, filters, video-source
- [x] 3.9 Zod-валидация YouTube API
- [x] 3.10 `ApiResult<T>` discriminated union
- [x] 3.11 Фильтр Shorts в `youtube.filters.ts`
- [x] 3.12 `VIDEO_CONFIG` в `shared/config/video.ts`

### 1.4 DI-контейнер
- [x] 4.1 Container с `register<T>()`
- [x] 4.2 `composition-root.ts`
- [x] 4.3 Регистрация `VideoSource`
- [x] 4.4 `configureDevelopment()` + `configureProduction()`
- [x] 4.5 Прямые вызовы container → data layer

### 1.5 Роутинг, Layouts, SEO
- [x] 5.1 `/main` → 301 редирект
- [x] 5.2 `(marketing)/error.tsx`
- [x] 5.3 `(marketing)/loading.tsx`
- [x] 5.4 Suspense для VideoSection + ServicesSection
- [x] 5.5 `VideoSectionSkeleton` + `ServicesSectionSkeleton`
- [x] 5.6 `sitemap.ts`
- [x] 5.7 `robots.ts`
- [x] 5.8 `shared/lib/metadata.ts` (buildMetadata)
- [x] 5.9 `proxy.ts` для защиты /admin
- [x] 5.10 JSON-LD компоненты (OrganizationSchema, ServiceSchema)

### 1.6 Безопасность
- [x] 6.1 Git history проверен (ключ не найден)
- [~] 6.2 Отозвать API ключ в Google Cloud Console (ручная операция)
- [~] 6.3 Ограничить ключ по HTTP-рефереру (ручная операция)
- [x] 6.4 Zod-валидация env при старте
- [x] 6.5 `.env.example` актуализирован
- [x] 6.6 Security headers в `next.config.ts`
- [x] 6.7 Rate limiting для /admin/login

### 1.7 Производительность
- [x] 7.1 `revalidate: 300` для YouTube fetch
- [x] 7.2 `export const revalidate = 300` для главной
- [x] 7.3 `React.cache()` для дедупликации
- [~] 7.4 Сжать hero-bg.mp4 до 720p (ручная операция)
- [~] 7.5 Poster к hero-видео (ручная операция)
- [x] 7.6 `<img>` → `next/image` в video-carousel
- [x] 7.7 `remotePatterns` для i.ytimg.com
- [x] 7.8 medium thumbnails (320×180)
- [x] 7.9 Шрифты: subsets cyrillic + display swap + weight

### 1.8 Тестирование
- [x] 8.1 Vitest установлен
- [x] 8.2 Unit-тесты для youtube.filters
- [x] 8.3 Unit-тесты для parseDurationToSeconds
- [x] 8.4 Unit-тесты для ServiceColor
- [x] 8.5 Unit-тесты для YouTubeVideoId
- [x] 8.6 React Testing Library установлена
- [x] 8.7 GitHub Actions CI (lint + typecheck + test + build)
- [x] 8.8 tsconfig ужесточён

### 1.9 Подготовка к Backend
- [x] 9.1 Prisma установлен
- [x] 9.2 `schema.prisma` (User, Service, Partner, Setting)
- [x] 9.3 `docker-compose.yml` (PostgreSQL 16)
- [x] 9.4 Value Object `ServiceColor`
- [x] 9.5 Value Object `YouTubeVideoId`
- [x] 9.6 Rich domain model `Service` entity
- [x] 9.7 MemoryServiceRepository → `infrastructure/persistence/`
- [x] 9.8 `PrismaServiceRepository`
- [x] 9.9 `prisma/seed.ts`
- [x] 9.10 API routes: GET/POST /api/services
- [x] 9.11 Модуль-шаблон `createServicePage`

## Волна 2 — Компонентная архитектура (SOLID + Clean)

### 2.1 SOLID: SRP + OCP
- [x] SRP: home-page разбит
- [x] SRP: about-page разбит
- [x] OCP: реестр иконок (icons-map.ts)
- [x] OCP: serviceIcons убран из services-carousel
- [x] DRY: дубликат use-in-view удалён

### 2.2 SOLID: DIP + ISP
- [x] DIP: VideoSource абстракция
- [x] DIP: DI-контейнер register/get
- [x] DIP: composition-root
- [x] ISP: NavItem discriminated union

### 2.3 Clean Architecture
- [x] entities/: service, video, partner, contact
- [x] features/: home, about, youtube, service-page
- [x] shared/: ui, lib, config, types, api
- [x] infrastructure/persistence/
- [x] app/ — только роутинг и layout

### 2.4 DDD
- [x] ServiceColor Value Object
- [x] YouTubeVideoId Value Object
- [x] ServiceIconName branded type
- [x] Service rich domain model
- [x] Service.heroUrl getter
- [x] MemoryRepository → infrastructure/

### 2.5 12-Factor App
- [x] Config: VIDEO_CONFIG, MAX_VIDEOS, EXCLUDE_SHORTS
- [x] Backing Services: VideoSource абстракция
- [x] Build/Release: npm scripts (db:migrate, db:seed, release)
- [x] Dev/Prod Parity: docker-compose.yml, DATABASE_URL
- [x] Logs: logger.ts (JSON-логи)

### 2.6 Next.js Patterns
- [x] Server Components: site-logo, main-nav, particles
- [x] Streaming: Suspense boundaries
- [x] Error Boundaries: error.tsx
- [x] Loading States: loading.tsx
- [x] About Page: серверный компонент
- [x] Кэширование: ISR (revalidate: 300)

## Волна 3 — Завершающая

### 3.1 Безопасность
- [x] 3.1.1 Git history проверен (ключ не был закоммичен)
- [x] 3.1.2 Rate limiting для /admin/login
- [x] 3.1.3 proxy.ts с проверкой IP + cookie

### 3.2 Production-readiness
- [x] 3.2.1 /rent, /inspection, /sell — сервисные страницы
- [x] 3.2.2 /partners, /contacts — страницы
- [x] 3.2.3 Админ-панель: логин
- [x] 3.2.4 configureProduction() для Vercel
- [x] 3.2.5 SettingsRepository
- [x] 3.2.6 PrismaPartnerRepository

### 3.3 API и данные
- [x] 3.3.1 PUT /api/services/[slug]
- [x] 3.3.2 DELETE /api/services/[slug]
- [x] 3.3.3 GET /api/partners
- [x] 3.3.4 POST /api/contact
- [x] 3.3.5 console.error → logger
- [x] 3.3.6 MockVideoSource

### 3.4 Админ-панель
- [x] 3.4.1 Форма логина
- [x] 3.4.2 Dashboard навигация

### 3.5 Тестирование
- [x] 3.5.1 YouTubeVideoId unit-тесты
- [x] 3.5.2 Rate-limiter unit-тесты
- [x] 3.5.3 Всего 16 тестов

### 3.6 Качество кода
- [x] 3.6.1 ESLint: no-unused-vars (error), no-explicit-any (warn)
- [x] 3.6.2 ESLint: no-restricted-imports (next/router)
- [x] 3.6.3 tsconfig: strict mode

### 3.7 Оптимизация
- [x] 3.7.1 SiteHeader без "use client"
- [x] 3.7.2 shared/config/index.ts
- [x] 3.7.3 dynamic import для Prisma в production

### 3.8 DDD
- [x] 3.8.1 toServiceIconName валидатор
- [x] 3.8.2 Service.heroUrl геттер

---

## Статистика проекта

| Метрика | До | После |
|---------|----|-------|
| Маршруты | 5 | **18** |
| Тесты | 0 | **16** |
| ESLint errors | - | **0** |
| TypeScript errors | - | **0** |
| Папка components/ | 11 файлов | **удалена** |
| Папка lib/ | 2 файла | **удалена** |
| features/ | 0 | **10 папок** |
| entities/ | 2 | **8 папок** |
| shared/ui/ | 4 | **16 компонентов** |
| shared/config/ | 5 | **10 файлов** |
| API routes | 0 | **6 эндпоинтов** |

---

## План деплоя

### Архитектура

```
Hoster.by (домен)   Vercel (бесплатно)     Neon (бесплатно)
┌─────────┐         ┌──────────────┐       ┌──────────────┐
│  Домен   │───────→│  Next.js     │←─────→│  PostgreSQL  │
│ avtoway  │  DNS   │  (сайт)      │       │  (БД)        │
│  .by     │        └──────────────┘       └──────────────┘
└─────────┘
```

- Vercel — родной хостинг Next.js, бесплатно 100GB трафика
- Neon — PostgreSQL в облаке, бесплатно 0.5GB + 100h compute
- Домен остаётся у Hoster — только DNS на Vercel

### Стоимость по этапам

| Этап | Посетители | Цена/мес | Что используется |
|------|-----------|----------|------------------|
| **Старт** | до ~5 000/мес | **0 BYN** | Vercel Free + Neon Free + домен ~50 BYN/год |
| **Рост** | 5-50 000/мес | **~$25** | Vercel Pro ($20) + Neon Scale (~$5) или VPS Hoster (~20 BYN) |
| **Масштаб** | 50 000+/мес | **~$50-100** | Enterprise / VPS + CDN + выделенная БД |

Бесплатного тарифа хватит на 1-2 года обычного автосервиса.

### Шаги для деплоя

1. [ ] Зарегистрироваться на [Vercel](https://vercel.com) (через GitHub)
2. [ ] Зарегистрироваться на [Neon](https://neon.tech)
3. [ ] Создать БД в Neon, получить `DATABASE_URL`
4. [ ] Запушить код в GitHub-репозиторий
5. [ ] Подключить репозиторий к Vercel
6. [ ] Добавить переменные окружения в Vercel:
     - `DATABASE_URL` (PostgreSQL из Neon)
     - `YOUTUBE_API_KEY`
     - `YOUTUBE_CHANNEL_ID`
     - `AUTH_SECRET` (случайная строка)
     - `NEXT_PUBLIC_MAX_VIDEOS=15`
     - `EXCLUDE_SHORTS=true`
7. [ ] Настроить DNS у Hoster: CNAME на `cname.vercel-dns.com`
8. [ ] Включить SSL (автоматически через Vercel)
9. [ ] Проверить: открыть `https://avtoway.by`
