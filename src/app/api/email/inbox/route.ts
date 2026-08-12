import "@/di/composition-root";
import { NextResponse } from "next/server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 100);
    const db = getPrismaClient();
    const search = searchParams.get("search") ?? "";
    const where: any = { isDeleted: false };
    if (search) {
      where.OR = [
        { from: { contains: search } },
        { subject: { contains: search } },
        { textBody: { contains: search } },
      ];
    }
    const [items, total, unread] = await Promise.all([
      db.inboxEmail.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inboxEmail.count({ where }),
      db.inboxEmail.count({ where: { ...where, isRead: false } }),
    ]);
    return NextResponse.json({ ok: true, data: { items, total, unread, page, limit } });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const ids: string[] = body.ids ?? (body.id ? [body.id] : []);
    const db = getPrismaClient();
    if (body.permanent) {
      await db.inboxEmail.deleteMany({ where: { id: { in: ids } } });
    } else {
      await db.inboxEmail.updateMany({ where: { id: { in: ids } }, data: { isDeleted: true } });
    }
    return NextResponse.json({ ok: true, data: { deleted: ids } });
  } catch (e) { return toApiError(e); }
}
