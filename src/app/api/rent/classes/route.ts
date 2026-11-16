import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { rentClassSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { CarClass } from "@/entities/rent/rent-car.types";

export async function GET() {
  try {
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const classes = await repo.getClasses();
    return NextResponse.json({ ok: true, data: classes });
  } catch (e) { return toApiError(e); }
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");
    const parsed = validateOrResponse(rentClassSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const cls = await repo.createClass(parsed.data as unknown as Omit<CarClass, "id">);
    return NextResponse.json({ ok: true, data: cls }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
