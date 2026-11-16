import "@/di/composition-root";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { container } from "@/di/container";
import { requireAnyAuth, requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { inspectionReportInputSchema } from "@/entities/report/report.schema";
import type { InspectionReportRepository } from "@/entities/report/report.repository";

function repo() {
  return container.get<InspectionReportRepository>("InspectionReportRepository");
}

export async function GET() {
  try {
    await requireAnyAuth(["autopodbor.manage", "autopodbor.requests", "autopodbor.view"]);
    return NextResponse.json({ ok: true, data: await repo().list() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const parsed = validateOrResponse(inspectionReportInputSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const token = randomUUID().replace(/-/g, "").slice(0, 16);
    const created = await repo().create({ ...parsed.data, token });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "InspectionReport",
      entityId: created.id,
      details: { carTitle: created.carTitle, token: created.token },
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
