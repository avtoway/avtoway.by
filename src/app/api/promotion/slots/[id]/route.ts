import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, NotFoundError, ConflictError } from "@/shared/lib/errors";
import { adSlotUpdateSchema } from "@/entities/promotion/promotion.schema";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

const MARKETING_PERMS = ["services.manage", "audit.view"];

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<PromotionRepository>("PromotionRepository");
}

function revalidateAdPages() {
  for (const path of ["/", "/services", "/blog", "/works"]) revalidatePath(path);
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const { id } = await params;
    const existing = await repo().getSlot(id);
    if (!existing) throw new NotFoundError("Рекламный блок не найден");

    const parsed = validateOrResponse(adSlotUpdateSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    if (parsed.data.key && parsed.data.key !== existing.key) {
      const conflict = await repo().getSlotByKey(parsed.data.key);
      if (conflict) throw new ConflictError("Слот с таким ключом уже существует");
    }

    const updated = await repo().updateSlot(id, parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "AdSlot",
      entityId: id,
      details: { key: updated.key, isActive: updated.isActive },
    });

    revalidateAdPages();
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const { id } = await params;
    const existing = await repo().getSlot(id);
    if (!existing) throw new NotFoundError("Рекламный блок не найден");

    await repo().deleteSlot(id);
    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "AdSlot",
      entityId: id,
      details: { key: existing.key, title: existing.title },
    });

    revalidateAdPages();
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return toApiError(error);
  }
}
