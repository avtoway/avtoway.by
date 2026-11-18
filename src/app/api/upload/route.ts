import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { requireAnyAuth, requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { detectImage } from "@/shared/lib/image-type";

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

    // Гифки оставляем как есть (иначе потеряется анимация), остальное сжимаем в WebP.
    let output: Uint8Array = buffer;
    let extension = detected.extension;

    if (detected.mime !== "image/gif") {
      const pipeline = sharp(buffer).rotate();
      output = category === "avatars"
        ? await pipeline.resize(400, 400, { fit: "cover" }).webp({ quality: 85 }).toBuffer()
        : await pipeline.resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      extension = "webp";
    }

    const filename = `${randomUUID()}.${extension}`;
    const dir = join(process.cwd(), "public", "uploads", category);

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), output);

    return NextResponse.json({ ok: true, url: `/uploads/${category}/${filename}` });
  } catch (e) { return toApiError(e); }
}
