import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { normalizeTaxiRequirements, validateTaxiRequirements } from "@/shared/lib/taxi-requirements";
import { rentCarInputSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCar as RentCarEntity } from "@/entities/rent/rent-car.types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = container.get<RentCarRepository>("RentCarRepository");

  if (searchParams.get("types") === "true") {
    const types = await repo.getTypes();
    return NextResponse.json({ ok: true, data: types });
  }

  // showAll (inactive cars) is admin-only
  if (searchParams.get("showAll") === "true") {
    try {
      await requireAuth("rent.manage");
    } catch (e) { return toApiError(e); }
  }

  const cars = await repo.getAll({
    rentTypeSlug: searchParams.get("rentType") ?? undefined,
    classSlug: searchParams.get("class") ?? undefined,
    showAll: searchParams.get("showAll") === "true",
  });
  return NextResponse.json({ ok: true, data: cars });
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");

    const parsed = validateOrResponse(rentCarInputSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const { conditions, ...data } = parsed.data;
    const repo = container.get<RentCarRepository>("RentCarRepository");

    const types = await repo.getTypes();
    const rentType = types.find(type => type.id === data.rentTypeId);
    const taxiError = validateTaxiRequirements(data.taxiRequirements, rentType?.slug === "taxi");
    if (taxiError) return NextResponse.json({ ok: false, error: taxiError }, { status: 400 });

    const carData = {
      ...data,
      taxiRequirements: normalizeTaxiRequirements(data.taxiRequirements) || null,
    } as unknown as Omit<RentCarEntity, "id" | "rentType">;

    const car = await repo.create(carData);
    if (Array.isArray(conditions)) await repo.setCarConditions(car.id, conditions);
    return NextResponse.json({ ok: true, data: car }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
