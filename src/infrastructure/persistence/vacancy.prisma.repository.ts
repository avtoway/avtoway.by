import type { Vacancy, VacancyInput, VacancyUpdate } from "@/entities/vacancy/vacancy";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";
import { getPrismaClient } from "./prisma.client";

function toVacancy(record: any): Vacancy {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    department: record.department ?? undefined,
    location: record.location,
    employmentType: record.employmentType,
    workFormat: record.workFormat ?? undefined,
    experience: record.experience ?? undefined,
    schedule: record.schedule ?? undefined,
    salaryFrom: record.salaryFrom ?? undefined,
    salaryTo: record.salaryTo ?? undefined,
    salaryCurrency: record.salaryCurrency,
    salaryPeriod: record.salaryPeriod,
    salaryType: record.salaryType ?? "fixed",
    salaryNote: record.salaryNote ?? undefined,
    shortDescription: record.shortDescription,
    description: record.description ?? undefined,
    responsibilities: record.responsibilities ?? undefined,
    requirements: record.requirements ?? undefined,
    conditions: record.conditions ?? undefined,
    benefits: record.benefits ?? undefined,
    contactName: record.contactName ?? undefined,
    contactPhone: record.contactPhone ?? undefined,
    contactEmail: record.contactEmail ?? undefined,
    contactTelegram: record.contactTelegram ?? undefined,
    isActive: record.isActive,
    isFeatured: record.isFeatured,
    sortOrder: record.sortOrder,
    publishedAt: record.publishedAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

function toDbData(data: VacancyUpdate): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  const fields: Array<keyof VacancyUpdate> = [
    "slug",
    "title",
    "department",
    "location",
    "employmentType",
    "workFormat",
    "experience",
    "schedule",
    "salaryFrom",
    "salaryTo",
    "salaryCurrency",
    "salaryPeriod",
    "salaryType",
    "salaryNote",
    "shortDescription",
    "description",
    "responsibilities",
    "requirements",
    "conditions",
    "benefits",
    "contactName",
    "contactPhone",
    "contactEmail",
    "contactTelegram",
    "isActive",
    "isFeatured",
    "sortOrder",
  ];

  for (const field of fields) {
    if (data[field] === undefined) continue;
    db[field] = data[field] === "" ? null : data[field];
  }

  if (data.publishedAt !== undefined && data.publishedAt !== "") {
    db.publishedAt = new Date(data.publishedAt);
  }

  return db;
}

export class PrismaVacancyRepository implements VacancyRepository {
  async getAll(): Promise<Vacancy[]> {
    const db = getPrismaClient();
    const records = await db.vacancy.findMany({
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return records.map(toVacancy);
  }

  async getActive(): Promise<Vacancy[]> {
    const db = getPrismaClient();
    const records = await db.vacancy.findMany({
      where: {
        isActive: true,
        publishedAt: { lte: new Date() },
      },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    });
    return records.map(toVacancy);
  }

  async getById(id: string): Promise<Vacancy | null> {
    const db = getPrismaClient();
    const record = await db.vacancy.findUnique({ where: { id } });
    return record ? toVacancy(record) : null;
  }

  async getBySlug(slug: string): Promise<Vacancy | null> {
    const db = getPrismaClient();
    const record = await db.vacancy.findUnique({ where: { slug } });
    return record ? toVacancy(record) : null;
  }

  async create(data: VacancyInput): Promise<Vacancy> {
    const db = getPrismaClient();
    const record = await db.vacancy.create({ data: toDbData(data) as any });
    return toVacancy(record);
  }

  async update(id: string, data: VacancyUpdate): Promise<Vacancy> {
    const db = getPrismaClient();
    const record = await db.vacancy.update({ where: { id }, data: toDbData(data) as any });
    return toVacancy(record);
  }

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.vacancy.delete({ where: { id } });
  }
}
