import "@/di/composition-root";
import { NextResponse } from "next/server";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

/** Сотрудники для поля «ответственный» в заявках. */
export async function GET() {
  try {
    await requireAnyAuth(["autopodbor.requests", "autopodbor.view", "autopodbor.manage"]);
    const db = getPrismaClient();
    const users = await db.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      ok: true,
      data: users.map(user => ({
        id: user.id,
        name: user.profile?.name || user.login,
        login: user.login,
      })),
    });
  } catch (e) { return toApiError(e); }
}
