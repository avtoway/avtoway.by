import { describe, expect, it } from "vitest";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import { DEFAULT_FILTERS, filterCars, filtersToQuery, parseSellFilters, pricePair } from "./filters";

function car(overrides: Partial<SaleCar>): SaleCar {
  return {
    id: "id",
    slug: "car",
    title: "Test Car",
    priceUsd: 20000,
    isNegotiable: true,
    allowExchange: false,
    allowCredit: false,
    year: 2020,
    mileageKm: 100000,
    bodyType: "sedan",
    transmission: "auto",
    fuel: "gasoline",
    driveType: "fwd",
    steering: "left",
    condition: "used",
    customsCleared: true,
    vinVerified: true,
    originalPaint: false,
    noAccidents: false,
    serviceBook: false,
    isInspected: true,
    features: [],
    customSpecs: [],
    photos: [],
    city: "Минск",
    status: "available",
    isFeatured: false,
    isActive: true,
    viewsCount: 0,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sale filters", () => {
  const cars = [
    car({ id: "bmw", brandSlug: "bmw", brand: "BMW", modelSlug: "5-series", model: "5 Series", priceUsd: 25000, isFeatured: true }),
    car({ id: "toyota", brandSlug: "toyota", brand: "Toyota", modelSlug: "camry", model: "Camry", priceUsd: 15000, transmission: "auto", bodyType: "sedan" }),
    car({ id: "vw", brandSlug: "volkswagen", brand: "Volkswagen", modelSlug: "passat", model: "Passat", priceUsd: 18000, transmission: "robot", bodyType: "wagon", fuel: "diesel" }),
    car({ id: "sold", brandSlug: "audi", brand: "Audi", modelSlug: "a6", model: "A6", priceUsd: 30000, status: "sold" }),
  ];

  it("filters by brand and price in USD", () => {
    const result = filterCars(cars, { ...DEFAULT_FILTERS, brand: "bmw", priceMin: "20000", priceMax: "26000", currency: "USD" }, 3.2);
    expect(result.map(item => item.id)).toEqual(["bmw"]);
  });

  it("converts BYN price range to USD", () => {
    const result = filterCars(cars, { ...DEFAULT_FILTERS, priceMax: "64000", currency: "BYN" }, 3.2);
    expect(result.map(item => item.id)).toEqual(["toyota", "vw"]);
  });

  it("groups automatic transmissions", () => {
    const result = filterCars(cars, { ...DEFAULT_FILTERS, transmission: "automatic" }, 3.2);
    expect(result.map(item => item.id)).toContain("vw");
    expect(result.map(item => item.id)).toContain("bmw");
  });

  it("hides sold cars by default and shows them when requested", () => {
    expect(filterCars(cars, DEFAULT_FILTERS, 3.2).some(item => item.id === "sold")).toBe(false);
    expect(filterCars(cars, { ...DEFAULT_FILTERS, hideSold: false }, 3.2).some(item => item.id === "sold")).toBe(true);
  });

  it("parses URL filters and serializes them", () => {
    const filters = parseSellFilters({ brand: "bmw", currency: "USD", body: "sedan, wagon", hideSold: "0" });
    expect(filters.brand).toBe("bmw");
    expect(filters.currency).toBe("USD");
    expect(filters.bodyTypes).toEqual(["sedan", "wagon"]);
    expect(filters.hideSold).toBe(false);
    expect(filtersToQuery(filters)).toContain("brand=bmw");
  });

  it("formats both currencies", () => {
    expect(pricePair(car({ priceUsd: 20000 }), 3.2, "BYN").primary).toBe("64\u00a0000 р.");
    expect(pricePair(car({ priceUsd: 20000 }), 3.2, "USD").primary).toBe("$20\u00a0000");
  });
});
