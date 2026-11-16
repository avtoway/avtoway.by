import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { normalizeTaxiRequirements, validateTaxiRequirements } from "@/shared/lib/taxi-requirements";
import { rentCarUpdateSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCar as RentCarEntity } from "@/entities/rent/rent-car.types";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
    const { id } = await params;

    const parsed = validateOrResponse(rentCarUpdateSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const { conditions, ...data } = parsed.data;

    const repo = container.get<RentCarRepository>("RentCarRepository");
    const [types, existing] = await Promise.all([repo.getTypes(), repo.getById(id)]);
    const rentTypeId = data.rentTypeId ?? existing?.rentTypeId;
    const rentType = types.find(type => type.id === rentTypeId);

    // taxiRequirements может отсутствовать в патче — тогда проверяем уже сохранённое значение.
    const requirementsValue = data.taxiRequirements !== undefined ? data.taxiRequirements : existing?.taxiRequirements;
    const taxiError = validateTaxiRequirements(requirementsValue, rentType?.slug === "taxi");
    if (taxiError) return NextResponse.json({ ok: false, error: taxiError }, { status: 400 });

    const carData = {
      ...data,
      ...(data.taxiRequirements !== undefined
        ? { taxiRequirements: normalizeTaxiRequirements(data.taxiRequirements) || null }
        : {}),
    } as unknown as Partial<RentCarEntity>;

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
