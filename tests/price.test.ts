import { describe, it, expect } from "vitest";
import { calculateRentPrice, getPeriodPrices, findTier, getPerDayRate, type RentPricingTier } from "@/shared/lib/price";

const TIERS: RentPricingTier[] = [
  { id: "1", minDays: 1, maxDays: 2, discount: 0, sortOrder: 1 },
  { id: "2", minDays: 3, maxDays: 7, discount: 10, sortOrder: 2 },
  { id: "3", minDays: 8, maxDays: 14, discount: 17, sortOrder: 3 },
  { id: "4", minDays: 15, maxDays: 30, discount: 25, sortOrder: 4 },
  { id: "5", minDays: 31, maxDays: null, discount: 32, sortOrder: 5 },
];

// priceDay = 100
const car = { priceDay: 100 };
const taxi = { price7Days: 500 };

describe("findTier", () => {
  it("находит ступень по границам", () => {
    expect(findTier(TIERS, 1)?.discount).toBe(0);
    expect(findTier(TIERS, 2)?.discount).toBe(0);
    expect(findTier(TIERS, 3)?.discount).toBe(10);
    expect(findTier(TIERS, 7)?.discount).toBe(10);
    expect(findTier(TIERS, 8)?.discount).toBe(17);
    expect(findTier(TIERS, 14)?.discount).toBe(17);
    expect(findTier(TIERS, 15)?.discount).toBe(25);
    expect(findTier(TIERS, 30)?.discount).toBe(25);
    expect(findTier(TIERS, 31)?.discount).toBe(32);
    expect(findTier(TIERS, 90)?.discount).toBe(32);
  });
});

describe("getPerDayRate", () => {
  it("считает цену за сутки со скидкой", () => {
    expect(getPerDayRate(100, 1, TIERS)).toBe(100);
    expect(getPerDayRate(100, 3, TIERS)).toBe(90);
    expect(getPerDayRate(100, 8, TIERS)).toBe(83);
    expect(getPerDayRate(100, 15, TIERS)).toBe(75);
    expect(getPerDayRate(100, 31, TIERS)).toBe(68);
  });
});

describe("calculateRentPrice — личные цели (ступени)", () => {
  it("1 сутки = базовая цена", () => {
    expect(calculateRentPrice(car, 1, TIERS, false)).toBe(100);
  });

  it("2 суток = без скидки (2 × 100)", () => {
    expect(calculateRentPrice(car, 2, TIERS, false)).toBe(200);
  });

  it("3 суток = 90/сутки (10%) × 3", () => {
    expect(calculateRentPrice(car, 3, TIERS, false)).toBe(270);
  });

  it("8 суток = 83/сутки (17%) × 8", () => {
    expect(calculateRentPrice(car, 8, TIERS, false)).toBe(664);
  });

  it("15 суток = 75/сутки (25%) × 15", () => {
    expect(calculateRentPrice(car, 15, TIERS, false)).toBe(1125);
  });

  it("31 сутки = 68/сутки (32%) × 31", () => {
    expect(calculateRentPrice(car, 31, TIERS, false)).toBe(2108);
  });

  it("без ступеней → базовая цена", () => {
    expect(calculateRentPrice(car, 10, [], false)).toBe(1000);
  });
});

describe("calculateRentPrice — такси (от недели)", () => {
  it("7 дней = 1 неделя", () => {
    expect(calculateRentPrice(taxi, 7, TIERS, true)).toBe(500);
  });

  it("8 дней = 2 недели (округляем вверх)", () => {
    expect(calculateRentPrice(taxi, 8, TIERS, true)).toBe(1000);
  });

  it("14 дней = 2 недели", () => {
    expect(calculateRentPrice(taxi, 14, TIERS, true)).toBe(1000);
  });

  it("без цены за неделю → 0", () => {
    expect(calculateRentPrice({}, 7, TIERS, true)).toBe(0);
  });
});

describe("getPeriodPrices", () => {
  it("возвращает все периоды со скидками", () => {
    const periods = getPeriodPrices(100, TIERS);
    expect(periods.map(p => p.perDay)).toEqual([100, 90, 83, 75, 68]);
    expect(periods.map(p => p.label)).toEqual(["1–2 суток", "3–7 суток", "8–14 суток", "15–30 суток", "31+ суток"]);
  });
});
