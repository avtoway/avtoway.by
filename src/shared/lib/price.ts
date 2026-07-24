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
  priceWeekTaxi?: number | null;
  priceDayTaxi?: number | null;
}): string | null {
  if (car.priceDay != null) return formatPrice(car.priceDay, "день");
  if (car.price3Days != null) return formatPrice(car.price3Days, "3 дня");
  if (car.price7Days != null) return formatPrice(car.price7Days, "нед");
  if (car.priceMonth != null) return formatPrice(car.priceMonth, "мес");
  if (car.priceWeekTaxi != null) return formatPrice(car.priceWeekTaxi, "нед");
  if (car.priceDayTaxi != null) return `~${formatPrice(car.priceDayTaxi, "день")}`;
  return null;
}

export function getPriceRows(car: {
  priceDay?: number | null;
  price3Days?: number | null;
  price7Days?: number | null;
  priceMonth?: number | null;
  priceWeekTaxi?: number | null;
  priceDayTaxi?: number | null;
}): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (car.priceDay != null) rows.push({ label: "1 день", value: formatPrice(car.priceDay)! });
  if (car.price3Days != null) rows.push({ label: "3 дня", value: formatPrice(car.price3Days)! });
  if (car.price7Days != null) rows.push({ label: "7 дней", value: formatPrice(car.price7Days)! });
  if (car.priceMonth != null) rows.push({ label: "Месяц", value: formatPrice(car.priceMonth)! });
  if (car.priceWeekTaxi != null) rows.push({ label: "Такси — неделя", value: formatPrice(car.priceWeekTaxi)! });
  if (car.priceDayTaxi != null) rows.push({ label: "Такси — день", value: `~${formatPrice(car.priceDayTaxi)}` });
  return rows;
}
