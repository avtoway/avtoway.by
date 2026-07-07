# Dev Log

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
