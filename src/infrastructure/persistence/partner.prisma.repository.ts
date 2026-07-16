import type { PartnerRepository } from "@/entities/partner/partner.repository";
import type { Partner } from "@/entities/partner/partner";
import { getPrismaClient } from "./prisma.client";

function toPartner(r: any): Partner {
  return {
    id: r.id,
    name: r.name,
    photo: r.photo ?? undefined,
    photos: r.photos ? (typeof r.photos === "string" ? JSON.parse(r.photos) : r.photos) : undefined,
    description: r.description ?? undefined,
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

  async create(data: Omit<Partner, "id">): Promise<Partner> {
    const db = getPrismaClient();
    const record = await db.partner.create({ data });
    return toPartner(record);
  }

  async update(id: string, data: Partial<Omit<Partner, "id">>): Promise<Partner> {
    const db = getPrismaClient();
    const record = await db.partner.update({ where: { id }, data });
    return toPartner(record);
  }

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.partner.delete({ where: { id } });
  }
}
