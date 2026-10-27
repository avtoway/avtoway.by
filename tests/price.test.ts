import { describe, it, expect } from "vitest";
import { calculateRentPrice, getPeriodPrices, DEFAULT_DISCOUNTS } from "@/shared/lib/price";

// priceDay = 100, discounts 20/25/30%
const car = { priceDay: 100 };
const taxi = { price7Days: 500 };

describe("calculateRentPrice — личные цели (проценты)", () => {
  it("1 сутки = базовая цена", () => {
    expect(calculateRentPrice(car, 1, DEFAULT_DISCOUNTS, false)).toBe(100);
  });

  it("2 суток = без скидки (2 × 100)", () => {
    expect(calculateRentPrice(car, 2, DEFAULT_DISCOUNTS, false)).toBe(200);
  });

  it("3 суток = 80/сутки (скидка 20%) × 3", () => {
    expect(calculateRentPrice(car, 3, DEFAULT_DISCOUNTS, false)).toBe(240);
  });

  it("8 суток = 75/сутки (скидка 25%) × 8", () => {
    expect(calculateRentPrice(car, 8, DEFAULT_DISCOUNTS, false)).toBe(600);
  });

  it("15 суток = 70/сутки (скидка 30%) × 15", () => {
    expect(calculateRentPrice(car, 15, DEFAULT_DISCOUNTS, false)).toBe(1050);
  });

  it("31 сутки = 70/сутки × 31", () => {
    expect(calculateRentPrice(car, 31, DEFAULT_DISCOUNTS, false)).toBe(2170);
  });
});

describe("calculateRentPrice — такси (от недели)", () => {
  it("7 дней = 1 неделя", () => {
    expect(calculateRentPrice(taxi, 7, DEFAULT_DISCOUNTS, true)).toBe(500);
  });

  it("8 дней = 2 недели (округляем вверх)", () => {
    expect(calculateRentPrice(taxi, 8, DEFAULT_DISCOUNTS, true)).toBe(1000);
  });

  it("14 дней = 2 недели", () => {
    expect(calculateRentPrice(taxi, 14, DEFAULT_DISCOUNTS, true)).toBe(1000);
  });

  it("без цены за неделю → 0", () => {
    expect(calculateRentPrice({}, 7, DEFAULT_DISCOUNTS, true)).toBe(0);
  });
});

describe("getPeriodPrices", () => {
  it("возвращает 4 периода со скидками", () => {
    const periods = getPeriodPrices(100, DEFAULT_DISCOUNTS);
    expect(periods.map(p => p.perDay)).toEqual([100, 80, 75, 70]);
    expect(periods.map(p => p.label)).toEqual(["1–2 суток", "3–7 суток", "8–14 суток", "15–31 суток"]);
  });
});
