import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { ANY_LEAD_ACCESS_PERMISSIONS } from "@/entities/crm/crm.access";
import type { CrmRepository } from "@/entities/crm/crm.repository";

export async function GET() {
  try {
    await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const repo = container.get<CrmRepository>("CrmRepository");
    return NextResponse.json({ ok: true, data: await repo.getAssignees() });
  } catch (error) {
    return toApiError(error);
  }
}
