import "@/di/composition-root";
import { NextResponse } from "next/server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const db = getPrismaClient();
    await db.inboxEmail.update({ where: { id }, data: body });
    return NextResponse.json({ ok: true });
  } catch (e) { return toApiError(e); }
}
