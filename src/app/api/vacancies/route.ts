import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { getAuthUser, requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, ValidationError, toApiError } from "@/shared/lib/errors";
import { VacancySchema } from "@/entities/vacancy/vacancy.schema";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const vacancyRepo = container.get<VacancyRepository>("VacancyRepository");
  const user = await getAuthUser();
  const canManage = user?.permissions.some((permission) => permission.startsWith("vacancies.")) ?? false;
  const vacancies = canManage ? await vacancyRepo.getAll() : await vacancyRepo.getActive();
  return NextResponse.json({ ok: true, data: vacancies });
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("vacancies.manage");

    const body = await request.json().catch(() => ({}));
    const parsed = validateOrResponse(VacancySchema, body);
    if (!("validated" in parsed)) return parsed;

    const vacancyRepo = container.get<VacancyRepository>("VacancyRepository");
    const existing = await vacancyRepo.getBySlug(parsed.data.slug);
    if (existing) throw new ConflictError("Вакансия с таким slug уже существует");

    if (parsed.data.publishedAt && Number.isNaN(new Date(parsed.data.publishedAt).getTime())) {
      throw new ValidationError("Некорректная дата публикации");
    }

    const publishedAt = parsed.data.publishedAt
      ? new Date(parsed.data.publishedAt).toISOString()
      : new Date().toISOString();

    const vacancy = await vacancyRepo.create({
      slug: parsed.data.slug,
      title: parsed.data.title,
      department: parsed.data.department || undefined,
      location: parsed.data.location || "Минск",
      employmentType: parsed.data.employmentType ?? "full_time",
      workFormat: parsed.data.workFormat || undefined,
      experience: parsed.data.experience || undefined,
      schedule: parsed.data.schedule || undefined,
      salaryFrom: parsed.data.salaryFrom ?? undefined,
      salaryTo: parsed.data.salaryTo ?? undefined,
      salaryCurrency: parsed.data.salaryCurrency || "BYN",
      salaryPeriod: parsed.data.salaryPeriod ?? "month",
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description || undefined,
      responsibilities: parsed.data.responsibilities || undefined,
      requirements: parsed.data.requirements || undefined,
      conditions: parsed.data.conditions || undefined,
      benefits: parsed.data.benefits || undefined,
      contactName: parsed.data.contactName || undefined,
      contactPhone: parsed.data.contactPhone || undefined,
      contactEmail: parsed.data.contactEmail || undefined,
      contactTelegram: parsed.data.contactTelegram || undefined,
      isActive: parsed.data.isActive ?? true,
      isFeatured: parsed.data.isFeatured ?? false,
      sortOrder: parsed.data.sortOrder ?? 0,
      publishedAt,
    });

    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "Vacancy",
      entityId: vacancy.id,
      details: { title: vacancy.title, slug: vacancy.slug },
    });

    revalidatePath("/vacancies");
    revalidatePath(`/vacancies/${vacancy.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: vacancy }, { status: 201 });
  } catch (e) {
    return toApiError(e);
  }
}
