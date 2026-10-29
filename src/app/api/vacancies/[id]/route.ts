import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, NotFoundError, ValidationError, toApiError } from "@/shared/lib/errors";
import { VacancySchema } from "@/entities/vacancy/vacancy.schema";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth("vacancies.manage");

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(VacancySchema.partial(), body);
    if (!("validated" in parsed)) return parsed;

    const vacancyRepo = container.get<VacancyRepository>("VacancyRepository");
    const existing = await vacancyRepo.getById(id);
    if (!existing) throw new NotFoundError("Вакансия не найдена");

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const withSlug = await vacancyRepo.getBySlug(parsed.data.slug);
      if (withSlug && withSlug.id !== id) {
        throw new ConflictError("Вакансия с таким slug уже существует");
      }
    }

    if (parsed.data.publishedAt && Number.isNaN(new Date(parsed.data.publishedAt).getTime())) {
      throw new ValidationError("Некорректная дата публикации");
    }

    const updateData = { ...parsed.data };
    if (updateData.location === "") updateData.location = "Минск";
    if (updateData.salaryCurrency === "") updateData.salaryCurrency = "BYN";
    if (updateData.publishedAt === "") delete updateData.publishedAt;

    const updated = await vacancyRepo.update(id, updateData);

    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "Vacancy",
      entityId: id,
      details: { title: updated.title, changes: Object.keys(body) },
    });

    revalidatePath("/vacancies");
    revalidatePath(`/vacancies/${existing.slug}`);
    if (updated.slug !== existing.slug) revalidatePath(`/vacancies/${updated.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return toApiError(e);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth("vacancies.manage");

    const { id } = await params;
    const vacancyRepo = container.get<VacancyRepository>("VacancyRepository");
    const existing = await vacancyRepo.getById(id);
    if (!existing) throw new NotFoundError("Вакансия не найдена");

    await vacancyRepo.delete(id);

    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "Vacancy",
      entityId: id,
      details: { title: existing.title, slug: existing.slug },
    });

    revalidatePath("/vacancies");
    revalidatePath(`/vacancies/${existing.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) {
    return toApiError(e);
  }
}
