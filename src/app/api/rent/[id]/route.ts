import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { normalizeTaxiRequirements, validateTaxiRequirements } from "@/shared/lib/taxi-requirements";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const [types, existing] = await Promise.all([repo.getTypes(), repo.getById(id)]);
    const rentTypeId = body.rentTypeId ?? existing?.rentTypeId;
    const rentType = types.find(type => type.id === rentTypeId);
    const taxiError = validateTaxiRequirements(body.taxiRequirements, rentType?.slug === "taxi");
    if (taxiError) return NextResponse.json({ ok: false, error: taxiError }, { status: 400 });
    body.taxiRequirements = normalizeTaxiRequirements(body.taxiRequirements) || null;
    const { conditions, ...carData } = body;
    const car = await repo.update(id, carData);
    if (Array.isArray(conditions)) await repo.setCarConditions(id, conditions);
    return NextResponse.json({ ok: true, data: car });
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
    await repo.delete(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
