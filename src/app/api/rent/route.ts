import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const repo = container.get<RentCarRepository>("RentCarRepository");

  if (searchParams.get("types") === "true") {
    const types = await repo.getTypes();
    return NextResponse.json({ ok: true, data: types });
  }

  const cars = await repo.getAll({
    rentTypeSlug: searchParams.get("rentType") ?? undefined,
  });
  return NextResponse.json({ ok: true, data: cars });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const car = await repo.create(body);
    return NextResponse.json({ ok: true, data: car }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
