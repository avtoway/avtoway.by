import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";

const ALLOWED = new Set(["admin-guide.docx", "seo-guide.docx", "ads-guide.docx"]);

interface Props {
  params: Promise<{ file: string }>;
}

/** Скачивание внутренних инструкций. Доступно только сотрудникам после входа. */
export async function GET(_request: Request, { params }: Props) {
  try {
    await requireAuth();
    const { file } = await params;
    if (!ALLOWED.has(file)) {
      return NextResponse.json({ ok: false, error: "Файл не найден" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "docs", "downloads", file);
    const buffer = await readFile(filePath);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${file}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return toApiError(error);
  }
}
