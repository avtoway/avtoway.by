const CURRENCY_SYMBOL = "BYN";

export function formatPrice(amount: number | null | undefined, period?: string): string | null {
  if (amount == null) return null;
  return `${amount} ${CURRENCY_SYMBOL}${period ? `/${period}` : ""}`;
}

/**
 * Скидки за длительный срок (для аренды «личные цели»), в процентах.
 * Настраиваются в админке → Калькулятор аренды → Настройки.
 */
export interface RentDiscounts {
  d3_7: number;   // % скидки на 3–7 суток
  d8_14: number;  // % скидки на 8–14 суток
  d15_31: number; // % скидки на 15–31 суток
}

export const DEFAULT_DISCOUNTS: RentDiscounts = { d3_7: 20, d8_14: 25, d15_31: 30 };

/** Цена за сутки для каждого периода (личные цели). */
export function getPeriodPrices(priceDay: number, discounts: RentDiscounts = DEFAULT_DISCOUNTS) {
  return [
    { label: "1–2 суток", perDay: priceDay },
    { label: "3–7 суток", perDay: Math.round(priceDay * (1 - discounts.d3_7 / 100)) },
    { label: "8–14 суток", perDay: Math.round(priceDay * (1 - discounts.d8_14 / 100)) },
    { label: "15–31 суток", perDay: Math.round(priceDay * (1 - discounts.d15_31 / 100)) },
  ];
}

function getPersonalPerDay(priceDay: number, days: number, discounts: RentDiscounts): number {
  if (days >= 15) return Math.round(priceDay * (1 - discounts.d15_31 / 100));
  if (days >= 8) return Math.round(priceDay * (1 - discounts.d8_14 / 100));
  if (days >= 3) return Math.round(priceDay * (1 - discounts.d3_7 / 100));
  return priceDay;
}

/**
 * Итоговая стоимость аренды.
 * Личные цели: цена за сутки × дни со скидкой по периоду.
 * Такси: только от недели, цена за неделю (округляем до целых недель вверх).
 */
export function calculateRentPrice(
  car: { priceDay?: number | null; price7Days?: number | null },
  days: number,
  discounts: RentDiscounts = DEFAULT_DISCOUNTS,
  isTaxi = false,
): number {
  const d = Math.max(1, Math.floor(days));
  if (isTaxi) {
    if (car.price7Days == null) return 0;
    return Math.ceil(d / 7) * car.price7Days;
  }
  if (car.priceDay == null) return 0;
  return getPersonalPerDay(car.priceDay, d, discounts) * d;
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
