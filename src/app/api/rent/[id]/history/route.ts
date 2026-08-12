import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarHistoryRepository } from "@/entities/rent/rent-car-history.repository";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const repo = container.get<RentCarHistoryRepository>("RentCarHistoryRepository");
    const history = await repo.getByCarId(id);
    return NextResponse.json({ ok: true, data: history });
  } catch (e) { return toApiError(e); }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarHistoryRepository>("RentCarHistoryRepository");
    const entry = await repo.create({ ...body, carId: id });
    return NextResponse.json({ ok: true, data: entry }, { status: 201 });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  request: Request,
  _params: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarHistoryRepository>("RentCarHistoryRepository");
    await repo.delete(body.id);
    return NextResponse.json({ ok: true, data: { deleted: body.id } });
  } catch (e) { return toApiError(e); }
}
