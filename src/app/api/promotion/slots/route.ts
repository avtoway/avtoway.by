import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, ConflictError } from "@/shared/lib/errors";
import { adSlotInputSchema } from "@/entities/promotion/promotion.schema";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

const MARKETING_PERMS = ["services.manage", "audit.view"];

function repo() {
  return container.get<PromotionRepository>("PromotionRepository");
}

function revalidateAdPages() {
  for (const path of ["/", "/services", "/blog", "/works"]) revalidatePath(path);
}

export async function GET() {
  try {
    await requireAnyAuth(MARKETING_PERMS);
    return NextResponse.json({ ok: true, data: await repo().listSlots() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAnyAuth(MARKETING_PERMS);
    const parsed = validateOrResponse(adSlotInputSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const existing = await repo().getSlotByKey(parsed.data.key);
    if (existing) throw new ConflictError("Слот с таким ключом уже существует");

    const created = await repo().createSlot({
      ...parsed.data,
      placement: parsed.data.placement,
      height: parsed.data.height ?? 250,
      isActive: parsed.data.isActive ?? false,
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "AdSlot",
      entityId: created.id,
      details: { key: created.key, title: created.title },
    });

    revalidateAdPages();
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
