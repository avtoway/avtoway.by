const CURRENCY_SYMBOL = "BYN";

export function formatPrice(amount: number | null | undefined, period?: string): string | null {
  if (amount == null) return null;
  return `${amount} ${CURRENCY_SYMBOL}${period ? `/${period}` : ""}`;
}

export function getPriceLabel(car: {
  priceDay?: number | null;
  price3Days?: number | null;
  price7Days?: number | null;
  priceMonth?: number | null;
  priceDayTaxi?: number | null;
}): string | null {
  if (car.priceDay != null) return formatPrice(car.priceDay, "день");
  if (car.price3Days != null) return formatPrice(car.price3Days, "3 дня");
  if (car.price7Days != null) return formatPrice(car.price7Days, "нед");
  if (car.priceMonth != null) return formatPrice(car.priceMonth, "мес");
  if (car.priceDayTaxi != null) return `~${formatPrice(car.priceDayTaxi, "день")}`;
  return null;
}

export function getPriceRows(car: {
  priceDay?: number | null;
  price3Days?: number | null;
  price7Days?: number | null;
  priceMonth?: number | null;
  priceDayTaxi?: number | null;
}): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (car.priceDay != null) rows.push({ label: "1 день", value: formatPrice(car.priceDay)! });
  if (car.price3Days != null) rows.push({ label: "3 дня", value: formatPrice(car.price3Days)! });
  if (car.price7Days != null) rows.push({ label: "7 дней / неделя", value: formatPrice(car.price7Days)! });
  if (car.priceMonth != null) rows.push({ label: "Месяц", value: formatPrice(car.priceMonth)! });
  if (car.priceDayTaxi != null) rows.push({ label: "Такси — день (среднее)", value: `~${formatPrice(car.priceDayTaxi)}` });
  return rows;
}

export interface RentPriceInput {
  priceDay?: number | null;
  price3Days?: number | null;
  price7Days?: number | null;
  priceMonth?: number | null;
}

/**
 * Периодная (ступенчатая) цена аренды.
 * Правило: 1 день → priceDay; 2–3 дня → price3Days/3 × дни;
 * 4–7 дней → price7Days/7 × дни; 8+ дней → priceMonth/30 × дни.
 * Если нужный тариф не задан — берём ближайший доступный.
 */
export function getPerDayRate(car: RentPriceInput, days: number): number | null {
  const d = Math.max(1, days);
  const tiers: { max: number; rate: number | null }[] = [
    { max: 1, rate: car.priceDay ?? null },
    { max: 3, rate: car.price3Days != null ? car.price3Days / 3 : null },
    { max: 7, rate: car.price7Days != null ? car.price7Days / 7 : null },
    { max: Infinity, rate: car.priceMonth != null ? car.priceMonth / 30 : null },
  ];
  for (const t of tiers) if (d <= t.max && t.rate != null) return t.rate;
  for (const t of tiers) if (t.rate != null) return t.rate;
  return null;
}

export function calculateRentPrice(car: RentPriceInput, days: number): number {
  const rate = getPerDayRate(car, days);
  if (rate == null) return 0;
  return Math.round(rate * Math.max(1, days));
}
