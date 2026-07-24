import type { RentCar, RentType } from "./rent-car.types";

export interface RentCarRepository {
  getAll(filters?: { rentTypeSlug?: string }): Promise<RentCar[]>;
  getBySlug(slug: string): Promise<RentCar | null>;
  getTypes(): Promise<RentType[]>;
  create(data: Omit<RentCar, "id" | "rentType">): Promise<RentCar>;
  update(id: string, data: Partial<RentCar>): Promise<RentCar>;
  delete(id: string): Promise<void>;
}
