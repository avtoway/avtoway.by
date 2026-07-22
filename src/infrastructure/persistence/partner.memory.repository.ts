import { NotFoundError } from "@/shared/lib/errors";
import type { PartnerRepository } from "@/entities/partner/partner.repository";
import type { Partner } from "@/entities/partner/partner";

let nextId = 1;
const store = new Map<string, Partner>();

const DEFAULTS: Partial<Partner> = {
  photo: undefined,
  photos: undefined,
  description: undefined,
  phone: undefined,
  email: undefined,
  address: undefined,
  contactPerson: undefined,
  website: undefined,
  instagram: undefined,
  telegram: undefined,
  vk: undefined,
  youtube: undefined,
};

export class MemoryPartnerRepository implements PartnerRepository {
  async getAll(): Promise<Partner[]> {
    return [...store.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getFeatured(): Promise<Partner[]> {
    return [...store.values()]
      .filter((p) => p.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 6);
  }

  async create(data: Omit<Partner, "id">): Promise<Partner> {
    const id = String(nextId++);
    const partner: Partner = { ...DEFAULTS, ...data, id } as Partner;
    store.set(id, partner);
    return partner;
  }

  async update(id: string, data: Partial<Omit<Partner, "id">>): Promise<Partner> {
    const existing = store.get(id);
    if (!existing) throw new NotFoundError("Партнёр не найден");
    const updated: Partner = { ...existing, ...data };
    store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    if (!store.has(id)) throw new NotFoundError("Партнёр не найден");
    store.delete(id);
  }
}
