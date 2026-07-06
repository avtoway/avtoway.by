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
- **Branch strategy:** feature branches → merge to master
- **Backup:** `scripts/snapshot.ps1` saves full snapshots to `snapshots/`

## 2026-07-07 — Landing page

- [x] Created landing page with hero, about, video gallery, services sections
- [x] Set up design system: primary red (#e63946), secondary navy (#1d3557)
- [x] Configured site metadata (title, description, OpenGraph)
- [x] Feature branch: `feature/landing-page` → merged to master
