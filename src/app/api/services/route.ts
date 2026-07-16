import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ServiceSchema } from "@/entities/service/service.schema";
import type { ServiceRepository } from "@/entities/service/service.repository";

export async function GET() {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const services = await serviceRepo.getAll();
  return NextResponse.json({ ok: true, data: services });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(ServiceSchema, body);
  if (!("validated" in parsed)) return parsed;

  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const existing = await serviceRepo.getBySlug(parsed.data.slug);
  if (existing) {
    return NextResponse.json({ ok: false, error: "Услуга с таким slug уже существует" }, { status: 409 });
  }

  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Service",
    entityId: parsed.data.slug,
    details: { title: parsed.data.title },
  });

  return NextResponse.json({ ok: true, data: parsed.data }, { status: 201 });
}
