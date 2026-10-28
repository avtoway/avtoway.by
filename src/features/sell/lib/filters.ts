import type { SaleCar } from "@/entities/sell/sale-car.types";

export type SaleCurrency = "BYN" | "USD";
export type SaleView = "grid" | "list";

export interface SellFilters {
  q: string;
  brand: string;
  model: string;
  generation: string;
  priceMin: string;
  priceMax: string;
  currency: SaleCurrency;
  yearMin: string;
  yearMax: string;
  transmission: string;
  fuel: string;
  engineMin: string;
  engineMax: string;
  bodyTypes: string[];
  drive: string;
  mileageMax: string;
  inspected: boolean;
  originalPaint: boolean;
  noAccidents: boolean;
  allowExchange: boolean;
  hideSold: boolean;
  sort: string;
  view: SaleView;
}

export const DEFAULT_FILTERS: SellFilters = {
  q: "",
  brand: "",
  model: "",
  generation: "",
  priceMin: "",
  priceMax: "",
  currency: "BYN",
  yearMin: "",
  yearMax: "",
  transmission: "",
  fuel: "",
  engineMin: "",
  engineMax: "",
  bodyTypes: [],
  drive: "",
  mileageMax: "",
  inspected: false,
  originalPaint: false,
  noAccidents: false,
  allowExchange: false,
  hideSold: true,
  sort: "recommended",
  view: "grid",
};

type Params = Record<string, string | string[] | undefined>;

function one(params: Params, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function num(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

export function parseSellFilters(params: Params): SellFilters {
  const body = one(params, "body");
  return {
    ...DEFAULT_FILTERS,
    q: one(params, "q"),
    brand: one(params, "brand"),
    model: one(params, "model"),
    generation: one(params, "generation"),
    priceMin: one(params, "priceMin"),
    priceMax: one(params, "priceMax"),
    currency: one(params, "currency") === "USD" ? "USD" : "BYN",
    yearMin: one(params, "yearMin"),
    yearMax: one(params, "yearMax"),
    transmission: one(params, "transmission"),
    fuel: one(params, "fuel"),
    engineMin: one(params, "engineMin"),
    engineMax: one(params, "engineMax"),
    bodyTypes: body ? body.split(",").map(item => item.trim()).filter(Boolean) : [],
    drive: one(params, "drive"),
    mileageMax: one(params, "mileageMax"),
    inspected: one(params, "inspected") === "1",
    originalPaint: one(params, "originalPaint") === "1",
    noAccidents: one(params, "noAccidents") === "1",
    allowExchange: one(params, "allowExchange") === "1",
    hideSold: one(params, "hideSold") !== "0",
    sort: one(params, "sort") || "recommended",
    view: one(params, "view") === "list" ? "list" : "grid",
  };
}

export function filtersToQuery(filters: SellFilters): string {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.brand) p.set("brand", filters.brand);
  if (filters.model) p.set("model", filters.model);
  if (filters.generation) p.set("generation", filters.generation);
  if (filters.priceMin) p.set("priceMin", filters.priceMin);
  if (filters.priceMax) p.set("priceMax", filters.priceMax);
  if (filters.currency !== "BYN") p.set("currency", filters.currency);
  if (filters.yearMin) p.set("yearMin", filters.yearMin);
  if (filters.yearMax) p.set("yearMax", filters.yearMax);
  if (filters.transmission) p.set("transmission", filters.transmission);
  if (filters.fuel) p.set("fuel", filters.fuel);
  if (filters.engineMin) p.set("engineMin", filters.engineMin);
  if (filters.engineMax) p.set("engineMax", filters.engineMax);
  if (filters.bodyTypes.length) p.set("body", filters.bodyTypes.join(","));
  if (filters.drive) p.set("drive", filters.drive);
  if (filters.mileageMax) p.set("mileageMax", filters.mileageMax);
  if (filters.inspected) p.set("inspected", "1");
  if (filters.originalPaint) p.set("originalPaint", "1");
  if (filters.noAccidents) p.set("noAccidents", "1");
  if (filters.allowExchange) p.set("allowExchange", "1");
  if (!filters.hideSold) p.set("hideSold", "0");
  if (filters.sort !== "recommended") p.set("sort", filters.sort);
  if (filters.view !== "grid") p.set("view", filters.view);
  return p.toString();
}

export function countActiveFilters(filters: SellFilters): number {
  let count = 0;
  if (filters.q) count++;
  if (filters.brand) count++;
  if (filters.model) count++;
  if (filters.generation) count++;
  if (filters.priceMin || filters.priceMax) count++;
  if (filters.yearMin || filters.yearMax) count++;
  if (filters.transmission) count++;
  if (filters.fuel) count++;
  if (filters.engineMin || filters.engineMax) count++;
  if (filters.bodyTypes.length) count++;
  if (filters.drive) count++;
  if (filters.mileageMax) count++;
  if (filters.inspected) count++;
  if (filters.originalPaint) count++;
  if (filters.noAccidents) count++;
  if (filters.allowExchange) count++;
  if (!filters.hideSold) count++;
  return count;
}

export function filterCars(cars: SaleCar[], filters: SellFilters, usdRate: number): SaleCar[] {
  const q = filters.q.trim().toLowerCase();
  const priceMin = num(filters.priceMin);
  const priceMax = num(filters.priceMax);
  const toUsd = (value: number | undefined) =>
    value == null ? undefined : filters.currency === "BYN" ? Math.round(value / usdRate) : value;
  const minUsd = toUsd(priceMin);
  const maxUsd = toUsd(priceMax);
  const yearMin = num(filters.yearMin);
  const yearMax = num(filters.yearMax);
  const engineMin = num(filters.engineMin);
  const engineMax = num(filters.engineMax);
  const mileageMax = num(filters.mileageMax);

  const result = cars.filter(car => {
    if (filters.hideSold && car.status === "sold") return false;
    if (filters.brand && car.brandSlug !== filters.brand) return false;
    if (filters.model && car.modelSlug !== filters.model) return false;
    if (filters.generation && !(car.generation ?? "").toLowerCase().includes(filters.generation.toLowerCase())) return false;
    if (minUsd != null && car.priceUsd < minUsd) return false;
    if (maxUsd != null && car.priceUsd > maxUsd) return false;
    if (yearMin != null && car.year < yearMin) return false;
    if (yearMax != null && car.year > yearMax) return false;
    if (filters.transmission === "automatic") {
      if (!["auto", "robot", "variator"].includes(car.transmission)) return false;
    } else if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.fuel && car.fuel !== filters.fuel) return false;
    if (engineMin != null && (car.engineVolume ?? 0) < engineMin) return false;
    if (engineMax != null && (car.engineVolume ?? 0) > engineMax) return false;
    if (filters.bodyTypes.length && !filters.bodyTypes.includes(car.bodyType)) return false;
    if (filters.drive && car.driveType !== filters.drive) return false;
    if (mileageMax != null && car.mileageKm > mileageMax) return false;
    if (filters.inspected && !car.isInspected) return false;
    if (filters.originalPaint && !car.originalPaint) return false;
    if (filters.noAccidents && !car.noAccidents) return false;
    if (filters.allowExchange && !car.allowExchange) return false;
    if (q) {
      const haystack = `${car.title} ${car.brand ?? ""} ${car.model ?? ""} ${car.vin ?? ""} ${car.generation ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return result.sort((a, b) => {
    switch (filters.sort) {
      case "fresh":
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      case "price_asc":
        return a.priceUsd - b.priceUsd;
      case "price_desc":
        return b.priceUsd - a.priceUsd;
      case "mileage_asc":
        return a.mileageKm - b.mileageKm;
      case "year_desc":
        return b.year - a.year;
      default:
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return +new Date(b.createdAt) - +new Date(a.createdAt);
    }
  });
}

export function priceInByn(car: Pick<SaleCar, "priceUsd" | "priceByn">, usdRate: number): number {
  return car.priceByn ?? Math.round(car.priceUsd * usdRate);
}

export function pricePair(car: SaleCar, usdRate: number, currency: SaleCurrency) {
  const byn = priceInByn(car, usdRate);
  const usd = car.priceUsd;
  return currency === "USD"
    ? { primary: `$${usd.toLocaleString("ru-RU")}`, secondary: `≈ ${byn.toLocaleString("ru-RU")} р.` }
    : { primary: `${byn.toLocaleString("ru-RU")} р.`, secondary: `≈ $${usd.toLocaleString("ru-RU")}` };
}
