import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, toApiError } from "@/shared/lib/errors";
import { ServiceSchema } from "@/entities/service/service.schema";
import type { ServiceRepository } from "@/entities/service/service.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
  const services = await serviceRepo.getAll();
  return NextResponse.json({ ok: true, data: services });
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("services.manage");

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(ServiceSchema, body);
    if (!("validated" in parsed)) return parsed;

    const serviceRepo = container.get<ServiceRepository>("ServiceRepository");
    const existing = await serviceRepo.getBySlug(parsed.data.slug);
    if (existing) throw new ConflictError("Услуга с таким slug уже существует");

    const created = await serviceRepo.create({
      slug: parsed.data.slug,
      title: parsed.data.title,
      desc: parsed.data.desc ?? "",
      href: parsed.data.href,
      color: parsed.data.color,
      iconName: parsed.data.iconName ?? "car",
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
      photo: parsed.data.photo,
      content: parsed.data.content,
    });

    await createAuditLog({
      userId: user.id, action: "CREATE", entity: "Service", entityId: created.slug,
      details: { title: created.title },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) { return toApiError(e); }
}