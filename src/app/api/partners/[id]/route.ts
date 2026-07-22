import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { AuthError, NotFoundError, toApiError } from "@/shared/lib/errors";
import { PartnerSchema } from "@/entities/partner/partner.schema";
import type { PartnerRepository } from "@/entities/partner/partner.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) throw new AuthError();

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(PartnerSchema.partial(), body);
    if (!("validated" in parsed)) return parsed;

    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    const updated = await partnerRepo.update(id, parsed.data);

    await createAuditLog({
      userId: user.id, action: "UPDATE", entity: "Partner", entityId: id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) throw new AuthError();

    const { id } = await params;
    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    await partnerRepo.delete(id);

    await createAuditLog({
      userId: user.id, action: "DELETE", entity: "Partner", entityId: id, details: {},
    });

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}