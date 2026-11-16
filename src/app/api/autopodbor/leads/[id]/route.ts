import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { toApiError } from "@/shared/lib/errors";
import { deleteLeadCrmData } from "@/shared/lib/lead-cleanup.server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { leadUpdateSchema } from "@/entities/autopodbor/autopodbor.schema";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";

function repo() {
  return container.get<AutoPodborRepository>("AutoPodborRepository");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAnyAuth(["autopodbor.requests", "autopodbor.manage"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" }, { status: 400 });
    }

    const updated = await repo().updateLead(id, parsed.data);

    // Синхронизируем CRM-поля в lead_meta, чтобы /admin/requests не показывал устаревшие данные.
    if (parsed.data.assignedToId !== undefined || parsed.data.internalNote !== undefined) {
      await getPrismaClient().leadMeta.upsert({
        where: { source_leadId: { source: "autopodbor", leadId: id } },
        update: {
          ...(parsed.data.assignedToId !== undefined ? { assignedToId: parsed.data.assignedToId } : {}),
          ...(parsed.data.internalNote !== undefined ? { internalNote: parsed.data.internalNote ?? null } : {}),
        },
        create: {
          source: "autopodbor",
          leadId: id,
          assignedToId: parsed.data.assignedToId ?? null,
          internalNote: parsed.data.internalNote ?? null,
        },
      });
    }

    await createAuditLog({ userId: user.id, action: "UPDATE", entity: "AutoPodborLead", entityId: id, details: body });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAnyAuth(["autopodbor.requests", "autopodbor.manage"]);
    const { id } = await params;
    await repo().deleteLead(id);
    await deleteLeadCrmData("autopodbor", id);
    await createAuditLog({ userId: user.id, action: "DELETE", entity: "AutoPodborLead", entityId: id });
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
