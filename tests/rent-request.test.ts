import { describe, it, expect } from "vitest";
import {
  daysBetween,
  firstValidationError,
  quoteRent,
  rentRequestSchema,
  type RentRequestInput,
} from "@/shared/lib/rent-request";
import type { RentPricingTier } from "@/shared/lib/price";

const TIERS: RentPricingTier[] = [
  { id: "1", minDays: 1, maxDays: 2, discount: 0, sortOrder: 1 },
  { id: "2", minDays: 3, maxDays: 7, discount: 10, sortOrder: 2 },
  { id: "3", minDays: 8, maxDays: 14, discount: 17, sortOrder: 3 },
  { id: "4", minDays: 15, maxDays: 30, discount: 25, sortOrder: 4 },
  { id: "5", minDays: 31, maxDays: null, discount: 32, sortOrder: 5 },
];

const VALID: RentRequestInput = {
  carId: "car-1",
  name: "Иван",
  phone: "+375291112233",
  startDate: "2026-11-01",
  endDate: "2026-11-05",
};

function parse(patch: Record<string, unknown> = {}) {
  return rentRequestSchema.safeParse({ ...VALID, ...patch });
}

describe("rentRequestSchema", () => {
  it("принимает корректную заявку", () => {
    expect(parse().success).toBe(true);
  });

  it("требует телефон или email", () => {
    const result = parse({ phone: null, email: null });
    expect(result.success).toBe(false);
    if (!result.success) expect(firstValidationError(result.error)).toBe("Укажите телефон или email");
  });

  it("пропускает заявку только с email", () => {
    expect(parse({ phone: null, email: "client@example.com" }).success).toBe(true);
  });

  it("отклоняет кривой email", () => {
    expect(parse({ phone: null, email: "not-an-email" }).success).toBe(false);
  });

  it("отклоняет дату окончания раньше начала", () => {
    expect(parse({ startDate: "2026-11-05", endDate: "2026-11-01" }).success).toBe(false);
  });

  it("отклоняет несуществующую дату", () => {
    expect(parse({ startDate: "2026-02-30" }).success).toBe(false);
  });

  it("ограничивает длину имени", () => {
    expect(parse({ name: "я".repeat(101) }).success).toBe(false);
  });

  it("ограничивает количество опций", () => {
    expect(parse({ extraIds: Array.from({ length: 21 }, (_, i) => `id-${i}`) }).success).toBe(false);
  });
});

describe("daysBetween", () => {
  it("считает сутки между датами", () => {
    expect(daysBetween("2026-11-01", "2026-11-05")).toBe(4);
  });

  it("возвращает отрицательное значение, если конец раньше начала", () => {
    expect(daysBetween("2026-11-05", "2026-11-01")).toBe(-4);
    expect(daysBetween("bad", "2026-11-01")).toBe(0);
  });
});

describe("quoteRent", () => {
  it("считает личную аренду со скидкой и опциями", () => {
    const quote = quoteRent({
      car: { priceDay: 100, classDeposit: 200, rentType: { slug: "rent" } },
      days: 5,
      tiers: TIERS,
      extras: [
        { name: "Детское кресло", price: 10, priceType: "perDay" },
        { name: "Доставка", price: 50, priceType: "perRental" },
      ],
    });

    expect(quote.isTaxi).toBe(false);
    expect(quote.base).toBe(450); // 100 − 10% = 90 × 5
    expect(quote.extrasTotal).toBe(100); // 10 × 5 + 50
    expect(quote.total).toBe(550);
    expect(quote.deposit).toBe(200);
    expect(quote.extrasLabel).toBe("Детское кресло, Доставка");
  });

  it("считает такси целыми неделями", () => {
    const quote = quoteRent({
      car: { price7Days: 500, rentType: { slug: "taxi" } },
      days: 8,
      tiers: TIERS,
      extras: [],
    });

    expect(quote.isTaxi).toBe(true);
    expect(quote.total).toBe(1000); // ceil(8 / 7) = 2 недели
    expect(quote.deposit).toBe(0);
  });

  it("не падает, если цена не задана", () => {
    const quote = quoteRent({
      car: { rentType: { slug: "rent" } },
      days: 3,
      tiers: TIERS,
      extras: [],
    });
    expect(quote.total).toBe(0);
  });
});
