import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { promotionCampaignInputSchema } from "@/entities/promotion/promotion.schema";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

const MARKETING_PERMS = ["services.manage", "audit.view"];

function repo() {
  return container.get<PromotionRepository>("PromotionRepository");
}

export async function GET() {
  try {
    await requireAnyAuth(MARKETING_PERMS);
    return NextResponse.json({ ok: true, data: await repo().listCampaigns() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const parsed = validateOrResponse(promotionCampaignInputSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const created = await repo().createCampaign({
      ...parsed.data,
      status: parsed.data.status ?? "planned",
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "PromotionCampaign",
      entityId: created.id,
      details: { title: created.title, channel: created.channel },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
