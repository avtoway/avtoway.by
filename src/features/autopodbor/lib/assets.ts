import { existsSync } from "node:fs";
import { join } from "node:path";

/** Есть ли файл в public по указанному URL (чтобы не рендерить битые картинки). */
export function publicAssetExists(src?: string | null): boolean {
  if (!src || !src.startsWith("/")) return false;
  return existsSync(join(process.cwd(), "public", src));
}
