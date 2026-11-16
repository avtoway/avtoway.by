import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { allowedLeadSources, ANY_LEAD_ACCESS_PERMISSIONS } from "@/entities/crm/crm.access";
import type { CrmRepository } from "@/entities/crm/crm.repository";

function repo() {
  return container.get<CrmRepository>("CrmRepository");
}

export async function GET(request: Request) {
  try {
    const user = await requireAnyAuth(ANY_LEAD_ACCESS_PERMISSIONS);
    const sources = allowedLeadSources(user.permissions);
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    if (phone) {
      return NextResponse.json({ ok: true, data: await repo().getClient(phone, sources) });
    }
    return NextResponse.json({
      ok: true,
      data: await repo().getClients(searchParams.get("search") ?? undefined, sources),
    });
  } catch (error) {
    return toApiError(error);
  }
}
