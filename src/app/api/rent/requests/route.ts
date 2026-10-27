import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function GET() {
  try {
    await requireAuth("rent.manage");
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const requests = await repo.getRentRequests();
    return NextResponse.json({ ok: true, data: requests });
  } catch (e) { return toApiError(e); }
}

// Public: create a rental request from the calculator
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ ok: false, error: "Укажите имя" }, { status: 400 });
    }
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const req = await repo.createRentRequest(body);
    return NextResponse.json({ ok: true, data: req }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
