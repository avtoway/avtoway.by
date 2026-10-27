import type { RentCar, RentType, CarClass, RentExtra, RentRequest } from "./rent-car.types";

export interface RentCarFilters {
  rentTypeSlug?: string;
  classSlug?: string;
  showAll?: boolean;
}

export interface RentCarRepository {
  getAll(filters?: RentCarFilters): Promise<RentCar[]>;
  getBySlug(slug: string): Promise<RentCar | null>;
  getTypes(): Promise<RentType[]>;
  create(data: Omit<RentCar, "id" | "rentType">): Promise<RentCar>;
  update(id: string, data: Partial<RentCar>): Promise<RentCar>;
  delete(id: string): Promise<void>;

  // Classes
  getClasses(): Promise<CarClass[]>;
  createClass(data: Omit<CarClass, "id">): Promise<CarClass>;
  updateClass(id: string, data: Partial<CarClass>): Promise<CarClass>;
  deleteClass(id: string): Promise<void>;

  // Extras
  getExtras(showAll?: boolean): Promise<RentExtra[]>;
  createExtra(data: Omit<RentExtra, "id">): Promise<RentExtra>;
  updateExtra(id: string, data: Partial<RentExtra>): Promise<RentExtra>;
  deleteExtra(id: string): Promise<void>;

  // Rental requests (calculator leads)
  createRentRequest(data: Omit<RentRequest, "id" | "createdAt" | "status">): Promise<RentRequest>;
  getRentRequests(): Promise<RentRequest[]>;
  updateRentRequestStatus(id: string, status: string): Promise<RentRequest>;
  deleteRentRequest(id: string): Promise<void>;
}
