import type { Partner } from "./partner";

export interface PartnerRepository {
  getAll(): Promise<Partner[]>;
  getFeatured(): Promise<Partner[]>;
  create(data: Omit<Partner, "id">): Promise<Partner>;
  update(id: string, data: Partial<Omit<Partner, "id">>): Promise<Partner>;
  delete(id: string): Promise<void>;
}
