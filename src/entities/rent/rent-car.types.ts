export interface RentCar {
  id: string;
  name: string;
  slug: string;
  brandId?: string;
  modelId?: string;
  brand?: string;
  model?: string;
  classId?: string;
  class?: string;
  classDeposit?: number;
  year?: number;
  color?: string;
  transmission?: string;
  fuel?: string;
  engineVolume?: string;
  seats?: number;
  features?: string;
  photos?: string;
  mainPhoto?: string;
  description?: string;
  priceDay?: number;
  price3Days?: number;
  price7Days?: number;
  priceMonth?: number;
  priceDayTaxi?: number;
  rentTypeId?: string;
  rentType?: { id: string; name: string; slug: string };
  isActive: boolean;
  bookedUntil?: string;
  sortOrder: number;
}

export interface RentType {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}

export interface CarClass {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  deposit?: number;
  minAge?: number;
}

export interface RentExtra {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceType: "perDay" | "perRental";
  price: number;
  isActive: boolean;
  sortOrder: number;
}

export interface RentRequest {
  id: string;
  carId?: string;
  car?: { id: string; name: string; slug: string };
  name: string;
  phone?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  extras?: string;
  total?: number;
  deposit?: number;
  status: string;
  message?: string;
  createdAt: string;
}
