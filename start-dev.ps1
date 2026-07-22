Write-Host "=== Запуск avtoway.by (dev) ===" -ForegroundColor Cyan

# 1. Поднять PostgreSQL
Write-Host "[1/4] Запуск PostgreSQL..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка: Docker Compose не найден. Установите Docker Desktop." -ForegroundColor Red; exit 1 }

# 2. Ждать готовности PostgreSQL
Write-Host "[2/4] Ожидание PostgreSQL..." -ForegroundColor Yellow
$maxRetries = 30
$retry = 0
do {
  $retry++
  $ready = docker compose exec -T postgres pg_isready -U avtoway -d avtoway_dev 2>$null
  if ($ready -match "accepting connections") { break }
  Write-Host "  Ждём PostgreSQL ($retry/$maxRetries)..."
  Start-Sleep -Seconds 2
} while ($retry -lt $maxRetries)

if ($retry -eq $maxRetries) { Write-Host "Ошибка: PostgreSQL не запустился" -ForegroundColor Red; exit 1 }
Write-Host "  PostgreSQL готов!" -ForegroundColor Green

# 3. Миграции
Write-Host "[3/4] Накат миграций..." -ForegroundColor Yellow
npx prisma migrate dev
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка миграции" -ForegroundColor Red; exit 1 }
Write-Host "  Миграции применены" -ForegroundColor Green

# 4. Seed
Write-Host "[4/4] Засев данных..." -ForegroundColor Yellow
npx tsx scripts/seed.ts
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка seed" -ForegroundColor Red; exit 1 }
Write-Host "  Данные засеяны" -ForegroundColor Green

Write-Host "=== Готово! Запускаю dev-сервер ===" -ForegroundColor Cyan
npm run dev
