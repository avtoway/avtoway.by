import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, NotFoundError, toApiError } from "@/shared/lib/errors";
import { PartnerSchema } from "@/entities/partner/partner.schema";
import type { PartnerRepository } from "@/entities/partner/partner.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth("partners.manage");

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(PartnerSchema.partial(), body);
    if (!("validated" in parsed)) return parsed;

    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    const existing = await partnerRepo.getById(id);
    if (!existing) throw new NotFoundError("Партнёр не найден");

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const withSlug = await partnerRepo.getBySlug(parsed.data.slug);
      if (withSlug && withSlug.id !== id) {
        throw new ConflictError("Партнёр с таким slug уже существует");
      }
    }

    const updated = await partnerRepo.update(id, parsed.data);

    await createAuditLog({
      userId: user.id, action: "UPDATE", entity: "Partner", entityId: id,
      details: { changes: Object.keys(body) },
    });

    revalidatePath("/partners");
    if (existing.slug) revalidatePath(`/partners/${existing.slug}`);
    if (updated.slug && updated.slug !== existing.slug) revalidatePath(`/partners/${updated.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth("partners.manage");

    const { id } = await params;
    const partnerRepo = container.get<PartnerRepository>("PartnerRepository");
    const existing = await partnerRepo.getById(id);
    if (!existing) throw new NotFoundError("Партнёр не найден");

    await partnerRepo.delete(id);

    await createAuditLog({
      userId: user.id, action: "DELETE", entity: "Partner", entityId: id,
      details: { name: existing.name, slug: existing.slug },
    });

    revalidatePath("/partners");
    if (existing.slug) revalidatePath(`/partners/${existing.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}