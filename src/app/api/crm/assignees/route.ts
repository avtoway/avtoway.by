import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { CrmRepository } from "@/entities/crm/crm.repository";

export async function GET() {
  try {
    await requireAuth("contacts.manage");
    const repo = container.get<CrmRepository>("CrmRepository");
    return NextResponse.json({ ok: true, data: await repo.getAssignees() });
  } catch (error) {
    return toApiError(error);
  }
}
