import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { CrmRepository } from "@/entities/crm/crm.repository";

function repo() {
  return container.get<CrmRepository>("CrmRepository");
}

export async function GET(request: Request) {
  try {
    await requireAuth("contacts.manage");
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    if (phone) {
      return NextResponse.json({ ok: true, data: await repo().getClient(phone) });
    }
    return NextResponse.json({ ok: true, data: await repo().getClients(searchParams.get("search") ?? undefined) });
  } catch (error) {
    return toApiError(error);
  }
}
