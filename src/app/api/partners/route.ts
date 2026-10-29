import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, toApiError } from "@/shared/lib/errors";
import { PartnerSchema } from "@/entities/partner/partner.schema";
import type { PartnerRepository } from "@/entities/partner/partner.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
  const partners = await partnerRepo.getAll();
  return NextResponse.json({ ok: true, data: partners });
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("partners.manage");

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(PartnerSchema, body);
    if (!("validated" in parsed)) return parsed;

    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    const existing = await partnerRepo.getBySlug(parsed.data.slug);
    if (existing) throw new ConflictError("Партнёр с таким slug уже существует");

    const partner = await partnerRepo.create({
      slug: parsed.data.slug,
      name: parsed.data.name,
      photo: parsed.data.photo || undefined,
      photos: parsed.data.photos?.length ? parsed.data.photos : undefined,
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description || undefined,
      services: parsed.data.services || undefined,
      advantages: parsed.data.advantages || undefined,
      workingHours: parsed.data.workingHours || undefined,
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
      userId: user.id, action: "CREATE", entity: "Partner", entityId: partner.id,
      details: { name: partner.name },
    });

    revalidatePath("/partners");
    revalidatePath(`/partners/${partner.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: partner }, { status: 201 });
  } catch (e) { return toApiError(e); }
}