import "server-only";
import { unlink } from "node:fs/promises";
import { join, normalize, sep } from "node:path";

const UPLOADS_ROOT = join(process.cwd(), "public", "uploads");

/**
 * Удаляет файл из /public/uploads по публичному URL.
 * Демо-файлы и подозрительные пути пропускаются.
 */
export async function deleteUploadFile(url?: string | null): Promise<void> {
  if (!url || !url.startsWith("/uploads/") || url.includes("..") || url.includes("demo-")) return;

  const relative = url.replace(/^\/uploads\//, "").split("?")[0];
  if (!relative) return;

  const absolute = normalize(join(UPLOADS_ROOT, relative));
  if (!absolute.startsWith(UPLOADS_ROOT + sep) && absolute !== UPLOADS_ROOT) return;

  try {
    await unlink(absolute);
  } catch {
    // Файла уже нет — это не ошибка.
  }
}

/** CSV-список путей или массив — удаляет все валидные файлы. */
export async function deleteUploadFiles(value?: string | string[] | null): Promise<void> {
  if (!value) return;
  const urls = Array.isArray(value)
    ? value
    : value.split(",").map(item => item.trim()).filter(Boolean);
  await Promise.all(urls.map(deleteUploadFile));
}
