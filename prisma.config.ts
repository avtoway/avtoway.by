import { defineConfig } from "@prisma/config";

/**
 * URL базы для Prisma CLI. В CI переменной нет, поэтому используем тот же
 * локальный SQLite-файл, что и приложение.
 */
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./data/avtoway.db",
  },
});
