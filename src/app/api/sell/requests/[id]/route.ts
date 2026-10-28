import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { saleRequestStatusUpdateSchema } from "@/entities/sell/sale-car.schema";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<SaleCarRepository>("SaleCarRepository");
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const user = await requireAuth("sell.manage");
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = validateOrResponse(saleRequestStatusUpdateSchema, body);
    if (!("validated" in parsed)) return parsed;

    const updated = await repo().updateRequestStatus(id, parsed.data.status);
    await createAuditLog({
      userId: user.id, action: "UPDATE", entity: "SaleRequest", entityId: id,
      details: { status: updated.status },
    });
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return toApiError(e);
  }
}

export async function DELETE(_: Request, { params }: Props) {
  try {
    const user = await requireAuth("sell.manage");
    const { id } = await params;
    await repo().deleteRequest(id);
    await createAuditLog({
      userId: user.id, action: "DELETE", entity: "SaleRequest", entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toApiError(e);
  }
}
