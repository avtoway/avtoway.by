import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ServiceSchema } from "@/entities/service/service.schema";
import type { ServiceRepository } from "@/entities/service/service.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(ServiceSchema.partial(), body);
  if (!("validated" in parsed)) return parsed;

  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");

  try {
    const updated = await serviceRepo.update(slug, parsed.data);

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Service",
      entityId: slug,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Неверный запрос";
    return NextResponse.json({ ok: false, error: message }, { status: message === "Услуга не найдена" ? 404 : 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const { slug } = await params;
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const existing = await serviceRepo.getBySlug(slug);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Услуга не найдена" }, { status: 404 });
  }

  await serviceRepo.delete(slug);

  await createAuditLog({
    userId: user.id,
    action: "DELETE",
    entity: "Service",
    entityId: slug,
    details: { title: existing.title },
  });

  return NextResponse.json({ ok: true, data: { deleted: slug } });
}
