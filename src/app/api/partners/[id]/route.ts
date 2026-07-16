import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
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
  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await partnerRepo.update(id, body);

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Partner",
      entityId: id,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
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
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ ok: false, error: message }, { status: 404 });
  }
}
