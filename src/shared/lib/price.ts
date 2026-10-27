const CURRENCY_SYMBOL = "BYN";

export function formatPrice(amount: number | null | undefined, period?: string): string | null {
  if (amount == null) return null;
  return `${amount} ${CURRENCY_SYMBOL}${period ? `/${period}` : ""}`;
}

/** Тарифная ступень (управляется в админке → Калькулятор → Тарифы). */
export interface RentPricingTier {
  id: string;
  minDays: number;
  maxDays?: number | null; // null = без верхней границы (31+)
  discount: number;        // % скидки от цены за сутки
  sortOrder: number;
}

/** Ступень, подходящая под количество суток. */
export function findTier(tiers: RentPricingTier[], days: number): RentPricingTier | null {
  const sorted = [...tiers].sort((a, b) => a.minDays - b.minDays);
  for (const t of sorted) {
    const max = t.maxDays ?? Infinity;
    if (days >= t.minDays && days <= max) return t;
  }
  for (const t of sorted) if (days >= t.minDays) return t;
  return null;
}

/** Цена за сутки для конкретного количества дней (со скидкой ступени). */
export function getPerDayRate(priceDay: number, days: number, tiers: RentPricingTier[]): number {
  const tier = findTier(tiers, days);
  if (!tier) return priceDay;
  return Math.round(priceDay * (1 - tier.discount / 100));
}

/** Цены за сутки по каждой ступени (для таблицы на странице авто). */
export function getPeriodPrices(priceDay: number, tiers: RentPricingTier[]) {
  const sorted = [...tiers].sort((a, b) => a.minDays - b.minDays);
  return sorted.map(t => ({
    label: t.maxDays == null ? `${t.minDays}+ суток` : `${t.minDays}–${t.maxDays} суток`,
    perDay: Math.round(priceDay * (1 - t.discount / 100)),
    discount: t.discount,
  }));
}

/**
 * Итоговая стоимость аренды.
 * Личные цели: цена за сутки × дни со скидкой по ступени.
 * Такси: только от недели, цена за неделю (округляем до целых недель вверх).
 */
export function calculateRentPrice(
  car: { priceDay?: number | null; price7Days?: number | null },
  days: number,
  tiers: RentPricingTier[],
  isTaxi = false,
): number {
  const d = Math.max(1, Math.floor(days));
  if (isTaxi) {
    if (car.price7Days == null) return 0;
    return Math.ceil(d / 7) * car.price7Days;
  }
  if (car.priceDay == null) return 0;
  return getPerDayRate(car.priceDay, d, tiers) * d;
}

/** Короткая «от …» цена для карточки и таблицы админки. */
export function getPriceLabel(car: {
  priceDay?: number | null;
  price7Days?: number | null;
  priceDayTaxi?: number | null;
  rentType?: { slug: string } | null;
}): string | null {
  const isTaxi = car.rentType?.slug === "taxi";
  if (isTaxi) {
    if (car.price7Days != null) return formatPrice(car.price7Days, "неделя");
    if (car.priceDayTaxi != null) return `~${formatPrice(car.priceDayTaxi, "день")}`;
    return null;
  }
  if (car.priceDay != null) return formatPrice(car.priceDay, "сутки");
  return null;
}
