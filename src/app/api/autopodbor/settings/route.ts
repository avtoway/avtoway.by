import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth, requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { revalidatePath } from "next/cache";
import { toApiError } from "@/shared/lib/errors";
import { settingsSchema } from "@/entities/autopodbor/autopodbor.schema";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";

function repo() {
  return container.get<AutoPodborRepository>("AutoPodborRepository");
}

export async function GET() {
  try {
    await requireAnyAuth(["autopodbor.view", "autopodbor.manage"]);
    return NextResponse.json({ ok: true, data: await repo().getSettings() });
  } catch (e) { return toApiError(e); }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const body = await request.json().catch(() => null);
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" }, { status: 400 });
    }

    const updated = await repo().updateSettings(parsed.data);
    await createAuditLog({ userId: user.id, action: "UPDATE", entity: "AutoPodborSettings", entityId: "main", details: body });
    revalidatePath("/services/inspection");

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return toApiError(e); }
}
