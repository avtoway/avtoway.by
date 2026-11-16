import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { rentConditionSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCondition } from "@/entities/rent/rent-car.types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
    const { id } = await params;
    const parsed = validateOrResponse(rentConditionSchema.partial(), await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const condition = await repo.updateCondition(id, parsed.data as unknown as Partial<RentCondition>);
    return NextResponse.json({ ok: true, data: condition });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
    const { id } = await params;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    await repo.deleteCondition(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
