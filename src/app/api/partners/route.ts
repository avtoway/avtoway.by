import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import type { PartnerRepository } from "@/entities/partner/partner.repository";

export async function GET() {
  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
  const partners = await partnerRepo.getAll();
  return NextResponse.json({ ok: true, data: partners });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (!body.name) {
      return NextResponse.json({ ok: false, error: "Название обязательно" }, { status: 400 });
    }

    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    const partner = await partnerRepo.create({
      name: body.name as string,
      photo: (body.photo as string) || undefined,
      photos: Array.isArray(body.photos) ? body.photos as string[] : undefined,
      description: (body.description as string) || undefined,
      phone: (body.phone as string) || undefined,
      email: (body.email as string) || undefined,
      address: (body.address as string) || undefined,
      contactPerson: (body.contactPerson as string) || undefined,
      website: (body.website as string) || undefined,
      instagram: (body.instagram as string) || undefined,
      telegram: (body.telegram as string) || undefined,
      vk: (body.vk as string) || undefined,
      youtube: (body.youtube as string) || undefined,
      isActive: (body.isActive as boolean) ?? true,
      sortOrder: (body.sortOrder as number) ?? 0,
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "Partner",
      entityId: partner.id,
      details: { name: partner.name },
    });

    return NextResponse.json({ ok: true, data: partner }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Неверный запрос" }, { status: 400 });
  }
}
