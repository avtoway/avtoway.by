import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { LEAD_SOURCES, leadNoteSchema } from "@/entities/crm/crm.schema";
import type { CrmRepository } from "@/entities/crm/crm.repository";
import type { LeadSource } from "@/entities/crm/crm.types";

function repo() {
  return container.get<CrmRepository>("CrmRepository");
}

export async function GET(request: Request) {
  try {
    await requireAuth("contacts.manage");
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const leadId = searchParams.get("leadId");
    if (!source || !LEAD_SOURCES.includes(source as LeadSource) || !leadId) {
      throw new ValidationError("Некорректная заявка");
    }
    return NextResponse.json({ ok: true, data: await repo().getNotes(source as LeadSource, leadId) });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("contacts.manage");
    const parsed = leadNoteSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные данные");

    const note = await repo().addNote(
      parsed.data.source,
      parsed.data.leadId,
      parsed.data.text,
      user.id,
      user.name,
    );
    await repo().advanceLeadStatus(parsed.data.source, parsed.data.leadId);
    return NextResponse.json({ ok: true, data: note }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
