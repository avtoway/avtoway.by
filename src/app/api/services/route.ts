import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
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

  try {
    const body = (await request.json()) as {
      slug: string;
      title: string;
      description?: string;
      color?: string;
      icon?: string;
    };

    if (!body.slug || !body.title) {
      return NextResponse.json({ ok: false, error: "slug и название обязательны" }, { status: 400 });
    }

    const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
    const existing = await serviceRepo.getBySlug(body.slug);
    if (existing) {
      return NextResponse.json({ ok: false, error: "Услуга с таким slug уже существует" }, { status: 409 });
    }

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "Service",
      entityId: body.slug,
      details: { title: body.title },
    });

    return NextResponse.json({ ok: true, data: body }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
}
