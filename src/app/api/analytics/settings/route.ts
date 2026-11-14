import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { analyticsSettingsSchema } from "@/entities/analytics/analytics.schema";
import type { AnalyticsRepository } from "@/entities/analytics/analytics.repository";

function repo() {
  return container.get<AnalyticsRepository>("AnalyticsRepository");
}

export async function GET() {
  try {
    await requireAuth("audit.view");
    return NextResponse.json({ ok: true, data: await repo().getSettings() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth("audit.view");
    const parsed = analyticsSettingsSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные настройки");

    const settings = await repo().updateSettings({
      ...parsed.data,
      gaId: parsed.data.gaId ?? "",
      ymId: parsed.data.ymId ?? "",
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "AnalyticsSettings",
      entityId: "main",
      details: { gaId: settings.gaId, ymId: settings.ymId, noindex: settings.noindex },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, data: settings });
  } catch (error) {
    return toApiError(error);
  }
}
