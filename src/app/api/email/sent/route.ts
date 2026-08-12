import "@/di/composition-root";
import { NextResponse } from "next/server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 100);
    const db = getPrismaClient();
    const [items, total] = await Promise.all([
      db.sentEmail.findMany({
        orderBy: { sentAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.sentEmail.count(),
    ]);
    return NextResponse.json({ ok: true, data: { items, total, page, limit } });
  } catch (e) { return toApiError(e); }
}
