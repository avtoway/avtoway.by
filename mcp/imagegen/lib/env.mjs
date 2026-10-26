import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Каталог mcp/imagegen (этот файл лежит в mcp/imagegen/lib).
 * Корень проекта = двумя уровнями выше.
 */
export const SERVER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const PROJECT_ROOT = process.env.IMAGEGEN_PROJECT_ROOT
  ? resolve(process.env.IMAGEGEN_PROJECT_ROOT)
  : resolve(SERVER_DIR, "..", "..");
export const PUBLIC_DIR = resolve(PROJECT_ROOT, "public");

function parseEnvFile(text) {
  const pairs = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    value = value.replace(/\\n/g, "\n");
    pairs.push([match[1], value]);
  }
  return pairs;
}

/** Какие .env файлы реально прочитаны (для check_setup). */
export const LOADED_ENV_FILES = [];

for (const file of [
  resolve(PROJECT_ROOT, ".env"),
  resolve(PROJECT_ROOT, ".env.local"),
  resolve(SERVER_DIR, ".env"),
]) {
  if (!existsSync(file)) continue;
  try {
    for (const [key, value] of parseEnvFile(readFileSync(file, "utf8"))) {
      if (process.env[key] === undefined) process.env[key] = value;
    }
    LOADED_ENV_FILES.push(file);
  } catch {
    /* пустой/битый .env не должен ронять сервер */
  }
}

export function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === "" ? fallback : value;
}

export function envInt(name, fallback) {
  const parsed = Number.parseInt(env(name, ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Папка, куда складываются готовые картинки. */
export const OUTPUT_ROOT = resolve(
  env("IMAGEGEN_OUTPUT_DIR", resolve(PUBLIC_DIR, "images", "generated")),
);

/** Сколько ждать один HTTP-запрос к провайдеру. */
export const HTTP_TIMEOUT_MS = envInt("IMAGEGEN_HTTP_TIMEOUT_MS", 240_000);

/** Сколько ждать асинхронную задачу (BFL/ComfyUI/Replicate). */
export const JOB_TIMEOUT_MS = envInt("IMAGEGEN_JOB_TIMEOUT_MS", 300_000);

export function maskSecret(value) {
  if (!value) return "не задан";
  if (value.length <= 6) return "***";
  return `${"*".repeat(Math.min(8, value.length - 4))}${value.slice(-4)}`;
}
