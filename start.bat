@echo off
chcp 65001 >nul
title avtoway.by — dev

echo ========================
echo   avtoway.by — dev
echo ========================
echo.

echo [1/4] Запуск PostgreSQL...
docker compose up -d
if %errorlevel% neq 0 (
  echo [ОШИБКА] Установи Docker Desktop и запусти его
  pause
  exit /b 1
)

echo [2/4] Ожидание PostgreSQL...
:wait
docker compose exec -T postgres pg_isready -U avtoway -d avtoway_dev >nul 2>&1
if errorlevel 1 (
  timeout /t 2 /nobreak >nul
  goto wait
)
echo   PostgreSQL готов

echo [3/4] Миграции + seed...
call npx prisma migrate dev 2>&1
call npx tsx scripts/seed.ts 2>&1

echo.
echo ========================
echo   Готово! Запуск dev
echo ========================
echo.
npm run dev

echo.
echo Сервер остановлен. Нажми любую клавишу...
pause >nul
