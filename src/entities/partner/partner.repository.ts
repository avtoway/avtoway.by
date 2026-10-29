import type { Partner } from "./partner";

export interface PartnerRepository {
  getAll(): Promise<Partner[]>;
  getFeatured(): Promise<Partner[]>;
  getById(id: string): Promise<Partner | null>;
  getBySlug(slug: string): Promise<Partner | null>;
  create(data: Omit<Partner, "id">): Promise<Partner>;
  update(id: string, data: Partial<Omit<Partner, "id">>): Promise<Partner>;
  delete(id: string): Promise<void>;
}
