import type { RentCarHistory } from "./rent-car-history.types";

export interface RentCarHistoryRepository {
  getByCarId(carId: string): Promise<RentCarHistory[]>;
  create(data: Omit<RentCarHistory, "id" | "createdAt">): Promise<RentCarHistory>;
  delete(id: string): Promise<void>;
}
