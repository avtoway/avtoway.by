# Развёртывание проекта AVTOWAY на новом компьютере

## 1. Требования

| Компонент | Версия | Как проверить |
|---|---|---|
| Node.js | 20+ (используется 24) | `node -v` |
| npm | 10+ | `npm -v` |
| Git | любая | `git --version` |
| SQLite | не нужен отдельно (встроен) | — |

## 2. Клонировать и установить

```bash
git clone https://github.com/avtoway/avtoway.by.git
cd avtoway.by
git checkout dev
npm install
```

## 3. Настроить env

Скопировать `.env.example` → `.env` и `.env.local` (создать):

```bash
# .env
DATABASE_URL="file:./data/avtoway.db"
```

```bash
# .env.local
YOUTUBE_API_KEY=твой_ключ
YOUTUBE_CHANNEL_ID=твой_канал
DATABASE_URL="file:./data/avtoway.db"
AUTH_SECRET="случайная-строка"
ENCRYPTION_KEY="случайные-64-hex-символа"
```

Сгенерировать ключи:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Подготовить БД

```bash
npx prisma db push
npx prisma generate
npm run seed   # или: npx tsx scripts/seed.ts
```

Seed создаёт: админа (`admin`/`admin123`), роли, типы аренды, топливо, коробки, марки авто, опции комфорта, контакты.

## 5. Запуск

```bash
npm run dev   # http://localhost:3000
```

Вход в админку: `http://localhost:3000/admin/login` — логин `admin`, пароль `admin123`.

## 6. Продакшен-сборка

```bash
npm run build
npm run start   # :3000
```

Для продакшена с PostgreSQL: `docker compose up -d` (см. docker-compose.yml), затем `DATABASE_URL=postgresql://... npx prisma migrate deploy`.

## Примечания

- **БД SQLite** находится в `data/avtoway.db` — не коммитится в git. При развёртывании база пустая, seed заполнит справочники.
- **Пароль админа** нужно сменить после первого входа.
- **Почта**: SMTP/IMAP настраивается в админке `/admin/email` → Настройки (пароли шифруются в БД).
- **Контакты** сайта редактируются в `/admin/contacts`.