import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function GET() {
  try {
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const tiers = await repo.getPricingTiers();
    return NextResponse.json({ ok: true, data: tiers });
  } catch (e) { return toApiError(e); }
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const tier = await repo.createPricingTier(body);
    return NextResponse.json({ ok: true, data: tier }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
