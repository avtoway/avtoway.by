/**
 * Разрешение путей и защита от выхода за пределы разрешённых корней.
 *
 * По умолчанию работать можно только внутри корня проекта (или внутри
 * каталогов из GIT_MCP_ALLOWED_ROOTS, разделитель — path.delimiter).
 */
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ToolError } from "./exec.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));

/**
 * Корень проекта. По умолчанию mcp/git/lib -> ../../.., но его можно
 * переопределить аргументом --root <путь> (удобно, когда сервер запускают
 * из каталога другого проекта).
 */
const ROOT_ARG_INDEX = process.argv.indexOf("--root");
const ROOT_FROM_ARG = ROOT_ARG_INDEX !== -1 ? process.argv[ROOT_ARG_INDEX + 1] : null;

export const PROJECT_ROOT = ROOT_FROM_ARG
  ? path.resolve(ROOT_FROM_ARG)
  : path.resolve(MODULE_DIR, "..", "..", "..");

/** Файл со списком дополнительных разрешённых каталогов (по одному в строке). */
export const ALLOWED_ROOTS_FILE = path.resolve(MODULE_DIR, "..", "allowed-roots.txt");

function normalizeRoot(value) {
  try {
    return realpathSync.native(value);
  } catch {
    return path.resolve(value);
  }
}

function readRootsFile() {
  if (!existsSync(ALLOWED_ROOTS_FILE)) return [];
  return readFileSync(ALLOWED_ROOTS_FILE, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => normalizeRoot(path.resolve(PROJECT_ROOT, line)));
}

export const ALLOWED_ROOTS = (() => {
  const extra = String(process.env.GIT_MCP_ALLOWED_ROOTS || "")
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeRoot);
  return [...new Set([normalizeRoot(PROJECT_ROOT), ...readRootsFile(), ...extra])];
})();

/** Проверяет, что путь лежит внутри одного из разрешённых корней. */
export function assertInsideAllowedRoot(absolutePath) {
  const normalized = normalizeRoot(absolutePath);
  const allowed = ALLOWED_ROOTS.some((root) => {
    const rel = path.relative(root, normalized);
    return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
  });
  if (!allowed) {
    throw new ToolError(`Путь вне разрешённых каталогов: ${absolutePath}`, {
      hint: `Разрешено: ${ALLOWED_ROOTS.join(", ")}. Расширить можно через GIT_MCP_ALLOWED_ROOTS в opencode.json.`,
    });
  }
  return normalized;
}

/** Каталог существующего репозитория/папки. */
export function resolveExistingDir(input, { mustBeRepo = false } = {}) {
  const absolute = path.resolve(PROJECT_ROOT, input || ".");
  if (!existsSync(absolute)) throw new ToolError(`Каталог не найден: ${absolute}`);
  if (!statSync(absolute).isDirectory()) throw new ToolError(`Это не каталог: ${absolute}`);
  assertInsideAllowedRoot(absolute);
  if (mustBeRepo && !existsSync(path.join(absolute, ".git")) && !existsSync(path.join(absolute, "HEAD"))) {
    // .git может быть файлом (worktree/submodule) — existsSync это покрывает.
    throw new ToolError(`В каталоге нет git-репозитория: ${absolute}`, {
      hint: "Укажи cwd внутри репозитория или сначала выполни git_init.",
    });
  }
  return absolute;
}

/** Путь, который может ещё не существовать (clone / init / worktree add). */
export function resolveTargetPath(input) {
  const absolute = path.resolve(PROJECT_ROOT, input || ".");
  // Проверяем ближайшего существующего предка.
  let probe = absolute;
  while (!existsSync(probe)) {
    const parent = path.dirname(probe);
    if (parent === probe) break;
    probe = parent;
  }
  assertInsideAllowedRoot(probe);
  return absolute;
}

/** Относительный путь для отображения в ответах. */
export function displayPath(absolutePath) {
  const rel = path.relative(PROJECT_ROOT, absolutePath);
  return (rel && !rel.startsWith("..") ? rel : absolutePath).replace(/\\/g, "/");
}
