import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { PartnerSchema } from "@/entities/partner/partner.schema";
import type { PartnerRepository } from "@/entities/partner/partner.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(PartnerSchema.partial(), body);
  if (!("validated" in parsed)) return parsed;

  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");

  try {
    const updated = await partnerRepo.update(id, parsed.data);

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Partner",
      entityId: id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неверный запрос";
    const status = message === "Партнёр не найден" ? 404 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { id } = await params;
  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");

  try {
    await partnerRepo.delete(id);

    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "Partner",
      entityId: id,
      details: {},
    });

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неверный запрос";
    return NextResponse.json({ ok: false, error: message }, { status: 404 });
  }
}
