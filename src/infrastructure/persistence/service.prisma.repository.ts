import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Service } from "@/entities/service/service.types";
import { getPrismaClient } from "./prisma.client";

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

  async update(slug: string, data: Partial<Service>): Promise<Service> {
    const db = getPrismaClient();
    const record = await db.service.update({ where: { slug }, data });
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
    href: `/${record.slug}`,
    color: record.color ?? "#ef4444",
    iconName: record.icon ?? "default",
    isActive: record.isActive,
    sortOrder: record.sortOrder,
  };
}
