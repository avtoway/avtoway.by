import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import type { ServiceLandingRepository } from "@/entities/service-landing/service-landing.repository";
import type { LandingContent } from "@/entities/service-landing/service-landing.types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: Props) {
  try {
    await requireAuth("services.manage");
    const { slug } = await params;
    const repo = container.get<ServiceLandingRepository>("ServiceLandingRepository");
    const landing = await repo.getBySlug(slug);
    if (!landing) throw new ValidationError("Лендинг не найден");
    return NextResponse.json({ ok: true, data: landing });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await requireAuth("services.manage");
    const { slug } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      seoTitle?: string;
      seoDescription?: string;
      ogTitle?: string;
      ogDescription?: string;
      content?: LandingContent;
      isActive?: boolean;
    };

    if (!body.content || typeof body.content !== "object") {
      throw new ValidationError("Некорректный контент лендинга");
    }
    const seoTitle = body.seoTitle?.trim();
    const seoDescription = body.seoDescription?.trim();
    if (!seoTitle) throw new ValidationError("Укажите SEO-заголовок");
    if (!seoDescription) throw new ValidationError("Укажите SEO-описание");

    const repo = container.get<ServiceLandingRepository>("ServiceLandingRepository");
    const updated = await repo.update(slug, {
      seoTitle,
      seoDescription,
      ogTitle: body.ogTitle?.trim() || undefined,
      ogDescription: body.ogDescription?.trim() || undefined,
      content: body.content,
      isActive: body.isActive,
    });

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "ServiceLanding",
      entityId: slug,
      details: { slug },
    });

    revalidatePath(`/services/${slug}`);
    revalidatePath("/services");
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return toApiError(error);
  }
}
