/**
 * Единая точка сборки.
 *
 * Локально просто запускает `next build` с текущим DATABASE_URL.
 * В CI базы и секретов ещё нет: создаём каталог, применяем миграции на пустую
 * SQLite и подставляем безопасные заглушки, чтобы prerender не падал.
 */
import { mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "file:./data/avtoway.db",
};

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env, shell: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.CI) {
  mkdirSync("data", { recursive: true });

  // Заглушки только для сборки: реальные значения задаются на проде.
  env.YOUTUBE_API_KEY ||= "ci-placeholder";
  env.YOUTUBE_CHANNEL_ID ||= "ci-placeholder";
  env.AUTH_SECRET ||= "ci-test-secret";
  env.ENCRYPTION_KEY ||= "0".repeat(64);

  // Миграции в репозитории устарели, поэтому для одноразовой CI-базы
  // синхронизируем схему напрямую из schema.prisma.
  run("npx", ["prisma", "db", "push"]);
}

run("npx", ["next", "build"]);
