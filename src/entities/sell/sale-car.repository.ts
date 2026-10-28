import type {
  SaleCar,
  SaleCarFilters,
  SaleCarInput,
  SaleRequest,
  SaleRequestInput,
} from "./sale-car.types";

export interface SaleCarRepository {
  getAll(filters?: SaleCarFilters): Promise<SaleCar[]>;
  getBySlug(slug: string): Promise<SaleCar | null>;
  getById(id: string): Promise<SaleCar | null>;
  create(data: SaleCarInput): Promise<SaleCar>;
  update(id: string, data: Partial<SaleCarInput>): Promise<SaleCar>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;

  getRequests(filters?: { type?: string; status?: string; search?: string }): Promise<SaleRequest[]>;
  countNewRequests(): Promise<number>;
  createRequest(data: SaleRequestInput & { status?: string }): Promise<SaleRequest>;
  updateRequestStatus(id: string, status: string): Promise<SaleRequest>;
  deleteRequest(id: string): Promise<void>;
}
