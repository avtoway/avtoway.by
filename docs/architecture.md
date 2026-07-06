# Architecture

## Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL + Prisma (planned)
- **Hosting:** Vercel (planned)

## Project Structure

```
src/
  app/          # Next.js App Router pages
    (marketing)/  # Public pages
    (dashboard)/  # Protected pages (future)
  components/   # Reusable UI components
  lib/          # Utilities, helpers, DB client
  styles/       # Global styles
docs/           # Documentation
scripts/        # Utility scripts (snapshot, deploy, etc.)
public/         # Static assets
  images/
snapshots/      # Auto-saved backups (gitignored? or not)
```

## Branch Strategy

- `master` — production-ready код (финальная ветка)
- `dev` — разработка и тестирование (сюда мержатся все фичи)
- `feature/*` — новые фичи (создаются от dev, мержатся в dev)
- `fix/*` — исправления багов (создаются от dev, мержатся в dev)
- `docs/*` — документация (создаются от dev, мержатся в dev)

### Flow

```
feature/video-gallery ──┐
feature/services ───────┤──► dev ──► master
feature/rental ─────────┘
```

## Modules (future)

- Landing / Marketing pages
- Blog / Video catalog
- Services catalog
- Car rental (booking system)
- Admin panel
