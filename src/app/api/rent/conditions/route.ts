import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { rentConditionSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCondition } from "@/entities/rent/rent-car.types";

export async function GET() {
  try {
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const conditions = await repo.getConditions();
    return NextResponse.json({ ok: true, data: conditions });
  } catch (e) { return toApiError(e); }
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");
    const parsed = validateOrResponse(rentConditionSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const condition = await repo.createCondition(parsed.data as unknown as Omit<RentCondition, "id">);
    return NextResponse.json({ ok: true, data: condition }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
