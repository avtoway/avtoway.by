import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Service } from "@/entities/service/service.types";
import { getPrismaClient } from "./prisma.client";

// DB column names differ from the domain `Service` type:
//   desc -> description, iconName -> icon. `href` is derived (not stored).
function toDbData(data: Partial<Service>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (data.title !== undefined) db.title = data.title;
  if (data.desc !== undefined) db.description = data.desc;
  if (data.color !== undefined) db.color = data.color;
  if (data.iconName !== undefined) db.icon = data.iconName;
  if (data.isActive !== undefined) db.isActive = data.isActive;
  if (data.sortOrder !== undefined) db.sortOrder = data.sortOrder;
  if (data.photo !== undefined) db.photo = data.photo || null;
  if (data.content !== undefined) db.content = data.content || null;
  return db;
}

export class PrismaServiceRepository implements ServiceRepository {
  async getAll(): Promise<Service[]> {
    const db = getPrismaClient();
    const records = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
    return records.map(toService);
  }

  async getBySlug(slug: string): Promise<Service | null> {
    const db = getPrismaClient();
    const record = await db.service.findUnique({ where: { slug } });
    return record ? toService(record) : null;
  }

  async getActive(): Promise<Service[]> {
    const db = getPrismaClient();
    const records = await db.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return records.map(toService);
  }

  async create(data: Omit<Service, "id">): Promise<Service> {
    const db = getPrismaClient();
    const record = await db.service.create({
      data: { slug: data.slug, ...toDbData(data) } as any,
    });
    return toService(record);
  }

  async update(slug: string, data: Partial<Service>): Promise<Service> {
    const db = getPrismaClient();
    const record = await db.service.update({ where: { slug }, data: toDbData(data) as any });
    return toService(record);
  }

  async delete(slug: string): Promise<void> {
    const db = getPrismaClient();
    await db.service.delete({ where: { slug } });
  }
}

function toService(record: any): Service {
  return {
    slug: record.slug,
    title: record.title,
    desc: record.description ?? "",
    href: `/services/${record.slug}`,
    color: record.color ?? "#ef4444",
    iconName: record.icon ?? "default",
    isActive: record.isActive,
    sortOrder: record.sortOrder,
    photo: record.photo ?? undefined,
    content: record.content ?? undefined,
  };
}
