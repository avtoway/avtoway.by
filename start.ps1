Write-Host "=== avtoway.by ===" -ForegroundColor Cyan

Write-Host "[1/4] Запуск PostgreSQL..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -ne 0) {
  Write-Host "[!] Установи Docker Desktop и запусти его" -ForegroundColor Red
  pause
  exit
}

Write-Host "[2/4] Ожидание PostgreSQL..." -ForegroundColor Yellow
do {
  $ready = docker compose exec -T postgres pg_isready -U avtoway -d avtoway_dev 2>$null
  if ($ready -match "accepting") { break }
  Start-Sleep 2
} while ($true)
Write-Host "  OK" -ForegroundColor Green

Write-Host "[3/4] Миграции..." -ForegroundColor Yellow
npx prisma migrate dev

Write-Host "[4/4] Seed..." -ForegroundColor Yellow
npx tsx scripts/seed.ts

Write-Host "=== Запуск dev-сервера ===" -ForegroundColor Cyan
npm run dev

pause
