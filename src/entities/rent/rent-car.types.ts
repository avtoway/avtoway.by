export interface RentCar {
  id: string;
  name: string;
  slug: string;
  photos?: string;
  description?: string;
  price?: number;
  rentTypeId?: string;
  rentType?: { id: string; name: string; slug: string };
  year?: number;
  transmission?: string;
  fuel?: string;
  seats?: number;
  engineVolume?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface RentType {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
}
