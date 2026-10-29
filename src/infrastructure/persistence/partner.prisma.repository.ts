import type { PartnerRepository } from "@/entities/partner/partner.repository";
import type { Partner } from "@/entities/partner/partner";
import { getPrismaClient } from "./prisma.client";

function parsePhotos(value: string | string[] | null | undefined): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function toPartner(r: any): Partner {
  return {
    id: r.id,
    slug: r.slug ?? undefined,
    name: r.name,
    photo: r.photo ?? undefined,
    photos: parsePhotos(r.photos),
    shortDescription: r.shortDescription ?? undefined,
    description: r.description ?? undefined,
    services: r.services ?? undefined,
    advantages: r.advantages ?? undefined,
    workingHours: r.workingHours ?? undefined,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    address: r.address ?? undefined,
    contactPerson: r.contactPerson ?? undefined,
    website: r.website ?? undefined,
    instagram: r.instagram ?? undefined,
    telegram: r.telegram ?? undefined,
    vk: r.vk ?? undefined,
    youtube: r.youtube ?? undefined,
    isActive: r.isActive,
    sortOrder: r.sortOrder,
  };
}

// `photos` is stored as a JSON string (the `photos` column).
function toDbData(data: Partial<Partner>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "photos") {
      const photos = v as string[] | undefined;
      db.photos = photos && photos.length ? JSON.stringify(photos) : null;
      continue;
    }
    if (k === "id") continue;
    db[k] = v;
  }
  return db;
}

export class PrismaPartnerRepository implements PartnerRepository {
  async getAll(): Promise<Partner[]> {
    const db = getPrismaClient();
    const records = await db.partner.findMany({ orderBy: { sortOrder: "asc" } });
    return records.map(toPartner);
  }

  async getFeatured(): Promise<Partner[]> {
    const db = getPrismaClient();
    const records = await db.partner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    });
    return records.map(toPartner);
  }

  async getById(id: string): Promise<Partner | null> {
    const db = getPrismaClient();
    const record = await db.partner.findUnique({ where: { id } });
    return record ? toPartner(record) : null;
  }

  async getBySlug(slug: string): Promise<Partner | null> {
    const db = getPrismaClient();
    const record = await db.partner.findUnique({ where: { slug } });
    return record ? toPartner(record) : null;
  }

  async create(data: Omit<Partner, "id">): Promise<Partner> {
    const db = getPrismaClient();
    const record = await db.partner.create({ data: toDbData(data) as any });
    return toPartner(record);
  }

  async update(id: string, data: Partial<Omit<Partner, "id">>): Promise<Partner> {
    const db = getPrismaClient();
    const record = await db.partner.update({ where: { id }, data: toDbData(data) as any });
    return toPartner(record);
  }

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.partner.delete({ where: { id } });
  }
}
