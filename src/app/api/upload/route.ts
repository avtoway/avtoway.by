import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";

// svg excluded: it can carry scripts (XSS)
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// Категории — это просто подпапки в public/uploads, чтобы фото авто не смешивались с фото партнёров.
const CATEGORIES = new Set(["partners", "rent", "avatars", "services", "general"]);

export async function POST(request: Request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Файл не выбран" }, { status: 400 });
    }

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ ok: false, error: "Недопустимый тип файла. Разрешены: jpg, png, webp, gif" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "Файл слишком большой. Максимум 10 МБ" }, { status: 400 });
    }

    const requested = new URL(request.url).searchParams.get("category") ?? "general";
    const category = CATEGORIES.has(requested) ? requested : "general";

    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads", category);
    const buffer = Buffer.from(await file.arrayBuffer());

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/${category}/${filename}` });
  } catch (e) { return toApiError(e); }
}
