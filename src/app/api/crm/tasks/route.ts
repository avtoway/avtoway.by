import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError, ValidationError, ForbiddenError } from "@/shared/lib/errors";
import { allowedLeadSources, canAccessLeadSource, ANY_LEAD_ACCESS_PERMISSIONS } from "@/entities/crm/crm.access";
import { leadTaskSchema, leadTaskUpdateSchema } from "@/entities/crm/crm.schema";
import type { CrmRepository } from "@/entities/crm/crm.repository";
import type { LeadSource } from "@/entities/crm/crm.types";

function repo() {
  return container.get<CrmRepository>("CrmRepository");
}

export async function GET(request: Request) {
  try {
    const user = await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const { searchParams } = new URL(request.url);
    return NextResponse.json({
      ok: true,
      data: await repo().getTasks(
        {
          status: searchParams.get("status") ?? undefined,
          source: searchParams.get("source") ?? undefined,
          leadId: searchParams.get("leadId") ?? undefined,
          clientPhone: searchParams.get("clientPhone") ?? undefined,
        },
        allowedLeadSources(user.permissions),
      ),
    });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const parsed = leadTaskSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные данные");
    if (!canAccessLeadSource(user.permissions, parsed.data.source as LeadSource)) throw new ForbiddenError();

    const task = await repo().createTask({
      ...parsed.data,
      createdById: user.id,
    });
    if (parsed.data.leadId) await repo().advanceLeadStatus(parsed.data.source, parsed.data.leadId);
    return NextResponse.json({ ok: true, data: task }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const parsed = leadTaskUpdateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные данные");
    const { id, ...data } = parsed.data;
    return NextResponse.json({ ok: true, data: await repo().updateTask(id, data) });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new ValidationError("Не указана задача");
    await repo().deleteTask(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return toApiError(error);
  }
}
