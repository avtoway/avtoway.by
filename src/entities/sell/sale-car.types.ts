export interface CustomSpec {
  label: string;
  value: string;
}

export interface SaleCar {
  id: string;
  slug: string;
  title: string;

  brandId?: string;
  modelId?: string;
  brand?: string;
  model?: string;
  brandSlug?: string;
  modelSlug?: string;
  generation?: string;

  priceUsd: number;
  priceByn?: number | null;
  oldPriceUsd?: number | null;
  isNegotiable: boolean;
  allowExchange: boolean;
  allowCredit: boolean;

  year: number;
  mileageKm: number;
  bodyType: string;
  transmission: string;
  fuel: string;
  engineVolume?: number;
  enginePowerHp?: number;
  driveType: string;
  color?: string;
  interiorMaterial?: string;
  interiorColor?: string;
  steering: string;
  seats?: number;
  doors?: number;

  condition: string;
  ownersCount?: string;
  originCountry?: string;
  customsCleared: boolean;
  vin?: string;
  vinVerified: boolean;
  originalPaint: boolean;
  noAccidents: boolean;
  serviceBook: boolean;

  isInspected: boolean;
  expertSummary?: string;
  bodyCheckNote?: string;
  techCheckNote?: string;
  legalCheckNote?: string;
  diagnosticsPdf?: string;

  features: string[];
  customSpecs: CustomSpec[];
  description?: string;
  mainPhoto?: string;
  photos: string[];
  videoUrl?: string;

  city: string;
  contactName?: string;
  contactPhone?: string;

  status: string;
  isFeatured: boolean;
  isActive: boolean;
  viewsCount: number;
  sortOrder: number;

  seoTitle?: string;
  seoDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export type SaleCarInput = Omit<
  SaleCar,
  | "id" | "brand" | "model" | "brandSlug" | "modelSlug" | "viewsCount" | "createdAt" | "updatedAt"
  | "priceByn" | "oldPriceUsd" | "engineVolume" | "enginePowerHp" | "seats" | "doors"
> & {
  priceByn?: number | null;
  oldPriceUsd?: number | null;
  engineVolume?: number | null;
  enginePowerHp?: number | null;
  seats?: number | null;
  doors?: number | null;
};

export interface SaleCarFilters {
  status?: string;
  search?: string;
  brandSlug?: string;
  modelSlug?: string;
  generation?: string;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  transmission?: string;
  fuel?: string;
  engineMin?: number;
  engineMax?: number;
  bodyTypes?: string[];
  driveType?: string;
  mileageMax?: number;
  inspected?: boolean;
  originalPaint?: boolean;
  noAccidents?: boolean;
  allowExchange?: boolean;
  hideSold?: boolean;
  showAll?: boolean;
  featured?: boolean;
  sort?: string;
  limit?: number;
}

export interface SaleRequest {
  id: string;
  type: string;
  carId?: string;
  car?: { id: string; title: string; slug: string; mainPhoto?: string; priceUsd: number };
  clientName: string;
  clientPhone: string;
  carInfo?: string;
  offerPrice?: number;
  comment?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleRequestInput {
  type: "buy" | "trade_in" | "sell_own";
  carId?: string;
  clientName: string;
  clientPhone: string;
  carInfo?: string;
  offerPrice?: number;
  comment?: string;
  company?: string;
}
