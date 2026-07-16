import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
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
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await serviceRepo.update(slug, body);

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Service",
      entityId: slug,
      details: { changes: Object.keys(body) },
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
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
