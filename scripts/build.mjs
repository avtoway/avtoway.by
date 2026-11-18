/**
 * Единая точка сборки.
 *
 * Локально просто запускает `next build` с текущим DATABASE_URL.
 * В CI базы ещё нет: создаём каталог, применяем миграции на пустую SQLite,
 * чтобы prerender мог обратиться к таблицам, и только потом собираем.
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
  run("npx", ["prisma", "migrate", "deploy"]);
}

run("npx", ["next", "build"]);
