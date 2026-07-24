import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const repo = container.get<RentCarRepository>("RentCarRepository");
  const car = await repo.update(id, body);
  return NextResponse.json({ ok: true, data: car });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const repo = container.get<RentCarRepository>("RentCarRepository");
  await repo.delete(id);
  return NextResponse.json({ ok: true, data: { deleted: id } });
}
