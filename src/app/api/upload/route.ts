import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";

// svg excluded: it can carry scripts (XSS)
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: Request) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Файл не выбран" }, { status: 400 });
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ ok: false, error: "Недопустимый тип файла. Разрешены: jpg, png, webp, gif" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ ok: false, error: "Файл слишком большой. Максимум 10 МБ" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), "public", "uploads", "partners");
    const buffer = Buffer.from(await file.arrayBuffer());

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);

    return NextResponse.json({ ok: true, url: `/uploads/partners/${filename}` });
  } catch (e) { return toApiError(e); }
}
