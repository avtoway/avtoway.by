param([switch]$Dev)

Write-Host "=== Установка avtoway.by ===" -ForegroundColor Cyan

Write-Host "[1] Установка зависимостей..." -ForegroundColor Yellow
npm ci
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка npm ci" -ForegroundColor Red; exit 1 }

Write-Host "[2] Генерация Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка prisma generate" -ForegroundColor Red; exit 1 }

Write-Host "[3] Запуск PostgreSQL..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка Docker. Установите Docker Desktop." -ForegroundColor Red; exit 1 }

Write-Host "[4] Ожидание PostgreSQL..." -ForegroundColor Yellow
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

Write-Host "[5] Миграции..." -ForegroundColor Yellow
npx prisma migrate dev
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка миграции" -ForegroundColor Red; exit 1 }

Write-Host "[6] Засев данных..." -ForegroundColor Yellow
npx tsx scripts/seed.ts
if ($LASTEXITCODE -ne 0) { Write-Host "Ошибка seed" -ForegroundColor Red; exit 1 }

Write-Host "=== Установка завершена ===" -ForegroundColor Cyan

if ($Dev) {
  Write-Host "Запуск dev-сервера..." -ForegroundColor Yellow
  npm run dev
} else {
  Write-Host ""
  Write-Host "Запусти dev-сервер:" -ForegroundColor Yellow
  Write-Host "  npm run dev" -ForegroundColor White
}
