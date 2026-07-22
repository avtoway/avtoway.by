@echo off
title avtoway.by

echo 1/4 Starting PostgreSQL...
docker compose up -d
if ERRORLEVEL 1 (
  echo ERROR: Docker not found
  pause
  exit /b 1
)

echo 2/4 Waiting for PostgreSQL...
:wait
docker compose exec -T postgres pg_isready -U avtoway -d avtoway_dev >nul 2>&1
if ERRORLEVEL 1 (
  timeout /t 2 /nobreak >nul
  goto wait
)
echo   OK

echo 3/4 Migrations...
call npx prisma migrate dev

echo 4/4 Seed...
call npx tsx scripts/seed.ts

echo.
echo Starting dev server...
echo.
npm run dev

pause
