import { describe, it, expect } from "vitest";
import { calculateRentPrice, getPerDayRate } from "@/shared/lib/price";

const car = {
  priceDay: 50,
  price3Days: 120, // 40/день
  price7Days: 245, // 35/день
  priceMonth: 900, // 30/день
};

describe("calculateRentPrice", () => {
  it("1 день = цена за сутки", () => {
    expect(calculateRentPrice(car, 1)).toBe(50);
  });

  it("2 дня = price3Days/3 × 2", () => {
    expect(calculateRentPrice(car, 2)).toBe(80);
  });

  it("3 дня = price3Days", () => {
    expect(calculateRentPrice(car, 3)).toBe(120);
  });

  it("5 дней = price7Days/7 × 5", () => {
    expect(calculateRentPrice(car, 5)).toBe(175);
  });

  it("7 дней = price7Days", () => {
    expect(calculateRentPrice(car, 7)).toBe(245);
  });

  it("10 дней = priceMonth/30 × 10", () => {
    expect(calculateRentPrice(car, 10)).toBe(300);
  });

  it("30 дней = priceMonth", () => {
    expect(calculateRentPrice(car, 30)).toBe(900);
  });

  it("пустой авто → 0", () => {
    expect(calculateRentPrice({}, 5)).toBe(0);
  });
});

describe("getPerDayRate", () => {
  it("выбирает тариф по сроку", () => {
    expect(getPerDayRate(car, 1)).toBe(50);
    expect(getPerDayRate(car, 3)).toBe(40);
    expect(getPerDayRate(car, 7)).toBe(35);
    expect(getPerDayRate(car, 30)).toBe(30);
  });

  it("фолбэк на доступный тариф, если нужного нет", () => {
    expect(getPerDayRate({ priceDay: 60 }, 10)).toBe(60);
    expect(getPerDayRate({ priceMonth: 600 }, 2)).toBe(20);
  });

  it("0 и отрицательные дни считаются как 1", () => {
    expect(getPerDayRate(car, 0)).toBe(50);
  });
});
