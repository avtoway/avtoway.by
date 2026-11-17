import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, NotFoundError } from "@/shared/lib/errors";
import { promotionCampaignUpdateSchema } from "@/entities/promotion/promotion.schema";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

const MARKETING_PERMS = ["services.manage", "audit.view"];

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<PromotionRepository>("PromotionRepository");
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const { id } = await params;
    const existing = await repo().getCampaign(id);
    if (!existing) throw new NotFoundError("Кампания не найдена");

    const parsed = validateOrResponse(promotionCampaignUpdateSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const updated = await repo().updateCampaign(id, parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "PromotionCampaign",
      entityId: id,
      details: { title: updated.title, status: updated.status },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const { id } = await params;
    const existing = await repo().getCampaign(id);
    if (!existing) throw new NotFoundError("Кампания не найдена");

    await repo().deleteCampaign(id);
    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "PromotionCampaign",
      entityId: id,
      details: { title: existing.title },
    });
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return toApiError(error);
  }
}
