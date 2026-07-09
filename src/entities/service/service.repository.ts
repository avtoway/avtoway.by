import type { Service } from "./service.types";

export interface ServiceRepository {
  getAll(): Promise<Service[]>;
  getBySlug(slug: string): Promise<Service | null>;
  getActive(): Promise<Service[]>;
}
