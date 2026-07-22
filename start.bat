@echo off
title avtoway.by - dev

echo 1/3 Migrations...
call npx prisma migrate dev

echo 2/3 Seed...
call npx tsx scripts/seed.ts

echo 3/3 Starting dev server...
echo.
npm run dev

pause
