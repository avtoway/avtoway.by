import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
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
    const cls = await repo.updateClass(id, body);
    return NextResponse.json({ ok: true, data: cls });
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
    await repo.deleteClass(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
