import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { getAuthUser } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { PartnerSchema } from "@/entities/partner/partner.schema";
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

  const body = await request.json().catch(() => ({}));
  const parsed = validateOrResponse(PartnerSchema, body);
  if (!("validated" in parsed)) return parsed;

  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
  const partner = await partnerRepo.create({
    name: parsed.data.name,
    photo: parsed.data.photo || undefined,
    photos: parsed.data.photos?.length ? parsed.data.photos : undefined,
    description: parsed.data.description || undefined,
    phone: parsed.data.phone || undefined,
    email: parsed.data.email || undefined,
    address: parsed.data.address || undefined,
    contactPerson: parsed.data.contactPerson || undefined,
    website: parsed.data.website || undefined,
    instagram: parsed.data.instagram || undefined,
    telegram: parsed.data.telegram || undefined,
    vk: parsed.data.vk || undefined,
    youtube: parsed.data.youtube || undefined,
    isActive: parsed.data.isActive ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  });

  await createAuditLog({
    userId: user.id,
    action: "CREATE",
    entity: "Partner",
    entityId: partner.id,
    details: { name: partner.name },
  });

  return NextResponse.json({ ok: true, data: partner }, { status: 201 });
}
