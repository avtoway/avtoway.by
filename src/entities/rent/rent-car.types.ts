export interface RentCar {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
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
  priceWeekTaxi?: number;
  priceDayTaxi?: number;
  rentTypeId?: string;
  rentType?: { id: string; name: string; slug: string };
  isActive: boolean;
  sortOrder: number;
}

export interface RentType {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}
