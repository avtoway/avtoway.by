import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { LEAD_SOURCES, leadMetaSchema } from "@/entities/crm/crm.schema";
import type { CrmRepository } from "@/entities/crm/crm.repository";
import type { LeadSource } from "@/entities/crm/crm.types";

function repo() {
  return container.get<CrmRepository>("CrmRepository");
}

function sourceParam(value: string | null): LeadSource {
  if (!value || !LEAD_SOURCES.includes(value as LeadSource)) throw new ValidationError("Некорректный источник заявки");
  return value as LeadSource;
}

export async function GET(request: Request) {
  try {
    await requireAuth("contacts.manage");
    const { searchParams } = new URL(request.url);
    const source = sourceParam(searchParams.get("source"));
    const leadId = searchParams.get("leadId");
    if (!leadId) throw new ValidationError("Не указана заявка");
    return NextResponse.json({ ok: true, data: await repo().getMeta(source, leadId) });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth("contacts.manage");
    const parsed = leadMetaSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные данные");

    const meta = await repo().upsertMeta(parsed.data.source, parsed.data.leadId, {
      assignedToId: parsed.data.assignedToId,
      rejectionReason: parsed.data.rejectionReason,
      nextContactAt: parsed.data.nextContactAt,
      internalNote: parsed.data.internalNote,
    });
    await repo().advanceLeadStatus(parsed.data.source, parsed.data.leadId);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "LeadMeta",
      entityId: `${parsed.data.source}:${parsed.data.leadId}`,
      details: { source: parsed.data.source, leadId: parsed.data.leadId },
    });
    return NextResponse.json({ ok: true, data: meta });
  } catch (error) {
    return toApiError(error);
  }
}
