import "@/di/composition-root";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("email.manage");
    const { id } = await params;
    const db = getPrismaClient();
    const email = await db.inboxEmail.findUnique({ where: { id } });
    if (!email) return NextResponse.json({ ok: false, error: "Не найдено" }, { status: 404 });
    if (!email.isRead) {
      await db.inboxEmail.update({ where: { id }, data: { isRead: true } });
    }
    return NextResponse.json({ ok: true, data: email });
  } catch (e) { return toApiError(e); }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("email.manage");
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    // Разрешаем менять только известные флаги, а не любые колонки письма.
    const data: { isRead?: boolean; isDeleted?: boolean } = {};
    if (typeof body.isRead === "boolean") data.isRead = body.isRead;
    if (typeof body.isDeleted === "boolean") data.isDeleted = body.isDeleted;
    if (Object.keys(data).length === 0) throw new ValidationError("Нет полей для обновления");

    const db = getPrismaClient();
    await db.inboxEmail.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) { return toApiError(e); }
}
