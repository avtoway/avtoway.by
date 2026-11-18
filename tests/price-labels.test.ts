import { describe, expect, it } from "vitest";
import { formatPrice, getPeriodPrices, getPriceLabel } from "@/shared/lib/price";

describe("price labels", () => {
  it("formats price with period and without", () => {
    expect(formatPrice(120, "сутки")).toBe("120 BYN/сутки");
    expect(formatPrice(1200)).toBe("1200 BYN");
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(undefined)).toBeNull();
  });

  it("builds period price table with discounts", () => {
    const rows = getPeriodPrices(100, [
      { id: "1", minDays: 1, maxDays: 3, discount: 0, sortOrder: 1 },
      { id: "2", minDays: 4, maxDays: null, discount: 10, sortOrder: 2 },
    ]);
    expect(rows[0]).toMatchObject({ label: "1–3 суток", perDay: 100, discount: 0 });
    expect(rows[1]).toMatchObject({ label: "4+ суток", perDay: 90, discount: 10 });
  });

  it("labels taxi prices and falls back to daily taxi price", () => {
    expect(getPriceLabel({ rentType: { slug: "taxi" }, price7Days: 700 })).toBe("700 BYN/неделя");
    expect(getPriceLabel({ rentType: { slug: "taxi" }, priceDayTaxi: 120 })).toBe("~120 BYN/день");
    expect(getPriceLabel({ rentType: { slug: "taxi" } })).toBeNull();
  });

  it("labels regular rent and returns null without price", () => {
    expect(getPriceLabel({ priceDay: 90 })).toBe("90 BYN/сутки");
    expect(getPriceLabel({})).toBeNull();
  });
});
