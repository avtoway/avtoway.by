import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { rentExtraSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentExtra } from "@/entities/rent/rent-car.types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const showAll = searchParams.get("showAll") === "true";
    // Скрытые опции — только для тех, кто управляет арендой.
    if (showAll) await requireAuth("rent.manage");
    const extras = await repo.getExtras(showAll);
    return NextResponse.json({ ok: true, data: extras });
  } catch (e) { return toApiError(e); }
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");
    const parsed = validateOrResponse(rentExtraSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const extra = await repo.createExtra(parsed.data as unknown as Omit<RentExtra, "id">);
    return NextResponse.json({ ok: true, data: extra }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
