import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { rentPricingTierSchema } from "@/entities/rent/rent.schema";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentPricingTier } from "@/entities/rent/rent-car.types";

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
    const parsed = validateOrResponse(rentPricingTierSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const tier = await repo.createPricingTier(parsed.data as unknown as Omit<RentPricingTier, "id">);
    return NextResponse.json({ ok: true, data: tier }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
