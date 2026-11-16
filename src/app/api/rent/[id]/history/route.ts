import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { rentHistoryEntrySchema } from "@/entities/rent/rent.schema";
import type { RentCarHistoryRepository } from "@/entities/rent/rent-car-history.repository";
import type { RentCarHistory } from "@/entities/rent/rent-car-history.types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
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
    await requireAuth("rent.manage");
    const { id } = await params;
    const parsed = validateOrResponse(rentHistoryEntrySchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const repo = container.get<RentCarHistoryRepository>("RentCarHistoryRepository");
    const entry = await repo.create({
      carId: id,
      ...parsed.data,
    } as unknown as Omit<RentCarHistory, "id" | "createdAt">);
    return NextResponse.json({ ok: true, data: entry }, { status: 201 });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  request: Request,
  _params: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth("rent.manage");
    const body = (await request.json().catch(() => ({}))) as { id?: unknown };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!id) throw new ValidationError("Не указана запись истории");
    const repo = container.get<RentCarHistoryRepository>("RentCarHistoryRepository");
    await repo.delete(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
