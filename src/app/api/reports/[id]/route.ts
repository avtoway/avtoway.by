import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAnyAuth, requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, NotFoundError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { inspectionReportUpdateSchema } from "@/entities/report/report.schema";
import type { InspectionReportRepository } from "@/entities/report/report.repository";

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<InspectionReportRepository>("InspectionReportRepository");
}

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireAnyAuth(["autopodbor.manage", "autopodbor.requests", "autopodbor.view"]);
    const { id } = await params;
    const report = await repo().getById(id);
    if (!report) throw new NotFoundError("Отчёт не найден");
    return NextResponse.json({ ok: true, data: report });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Отчёт не найден");

    const parsed = validateOrResponse(inspectionReportUpdateSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const updated = await repo().update(id, parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "InspectionReport",
      entityId: id,
      details: { carTitle: updated.carTitle, isPublished: updated.isPublished },
    });

    revalidatePath(`/report/${updated.token}`);
    revalidatePath("/report");
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Отчёт не найден");

    await repo().delete(id);
    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "InspectionReport",
      entityId: id,
      details: { carTitle: existing.carTitle, token: existing.token },
    });

    revalidatePath(`/report/${existing.token}`);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return toApiError(error);
  }
}
