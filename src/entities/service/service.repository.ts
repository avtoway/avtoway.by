import type { Service } from "./service.types";

export interface ServiceRepository {
  getAll(): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service | null>;
  getActive(): Promise<Service[]>;
  update(slug: string, data: Partial<Service>): Promise<Service>;
  delete(slug: string): Promise<void>;
}
