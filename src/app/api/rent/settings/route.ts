import "@/di/composition-root";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

const KEYS = ["rent_min_days", "rent_max_days", "rent_disc_3_7", "rent_disc_8_14", "rent_disc_15_31"];

export async function GET() {
  try {
    const db = getPrismaClient();
    const rows = await db.setting.findMany({ where: { key: { in: KEYS } } });
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return NextResponse.json({
      ok: true,
      data: {
        minDays: parseInt(map.rent_min_days ?? "1", 10) || 1,
        maxDays: parseInt(map.rent_max_days ?? "90", 10) || 90,
        discounts: {
          d3_7: parseInt(map.rent_disc_3_7 ?? "20", 10),
          d8_14: parseInt(map.rent_disc_8_14 ?? "25", 10),
          d15_31: parseInt(map.rent_disc_15_31 ?? "30", 10),
        },
      },
    });
  } catch (e) { return toApiError(e); }
}

export async function PUT(request: Request) {
  try {
    await requireAuth("rent.manage");
    const body = await request.json().catch(() => ({}));
    const db = getPrismaClient();

    const updates: Record<string, string> = {};
    if (body.minDays !== undefined) updates.rent_min_days = String(parseInt(body.minDays, 10) || 1);
    if (body.maxDays !== undefined) updates.rent_max_days = String(parseInt(body.maxDays, 10) || 90);
    if (body.discounts) {
      updates.rent_disc_3_7 = String(parseInt(body.discounts.d3_7, 10) || 0);
      updates.rent_disc_8_14 = String(parseInt(body.discounts.d8_14, 10) || 0);
      updates.rent_disc_15_31 = String(parseInt(body.discounts.d15_31, 10) || 0);
    }

    for (const [key, value] of Object.entries(updates)) {
      const existing = await db.setting.findUnique({ where: { key } });
      if (existing) await db.setting.update({ where: { key }, data: { value } });
      else await db.setting.create({ data: { key, value } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) { return toApiError(e); }
}
