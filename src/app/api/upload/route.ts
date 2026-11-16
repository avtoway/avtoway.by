import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireAnyAuth, requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Категории — это просто подпапки в public/uploads, чтобы фото авто не смешивались с фото партнёров.
const CATEGORIES = new Set(["partners", "rent", "sell", "avatars", "services", "general", "autopodbor"]);

/** Права, дающие доступ к загрузке контентных изображений (не аватарок). */
const CONTENT_UPLOAD_PERMISSIONS = [
  "services.manage",
  "partners.manage",
  "rent.manage",
  "sell.manage",
  "autopodbor.manage",
  "users.manage",
];

interface DetectedImage {
  extension: string;
  mime: string;
}

/**
 * Определяет тип изображения по сигнатуре (magic bytes), а не по заголовку из FormData.
 * SVG намеренно не поддерживается: он может содержать скрипты (XSS).
 */
export function detectImage(buffer: Buffer): DetectedImage | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { extension: "jpg", mime: "image/jpeg" };
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) {
    return { extension: "png", mime: "image/png" };
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF87a") {
    return { extension: "gif", mime: "image/gif" };
  }
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString("ascii") === "GIF89a") {
    return { extension: "gif", mime: "image/gif" };
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { extension: "webp", mime: "image/webp" };
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const requested = new URL(request.url).searchParams.get("category") ?? "general";
    const category = CATEGORIES.has(requested) ? requested : "general";

    // Аватар может загрузить любой сотрудник (свой профиль), контент — только редакторы модулей.
    if (category === "avatars") {
      await requireAuth();
    } else {
      await requireAnyAuth(CONTENT_UPLOAD_PERMISSIONS);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Файл не выбран" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "Файл слишком большой. Максимум 10 МБ" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImage(buffer);
    if (!detected) {
      throw new ValidationError("Недопустимый формат файла. Разрешены: jpg, png, webp, gif");
    }

    const filename = `${randomUUID()}.${detected.extension}`;
    const dir = join(process.cwd(), "public", "uploads", category);

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${category}/${filename}` });
  } catch (e) { return toApiError(e); }
}
