import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

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
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const { conditions, ...carData } = body;
    const car = await repo.create(carData);
    if (Array.isArray(conditions)) await repo.setCarConditions(car.id, conditions);
    return NextResponse.json({ ok: true, data: car }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
