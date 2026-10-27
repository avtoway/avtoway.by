import { z } from "zod";
import { calculateRentPrice, type RentPricingTier } from "./price";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** Сколько суток между датами (обе в формате YYYY-MM-DD). */
export function daysBetween(startDate: string, endDate: string): number {
  const from = Date.parse(`${startDate}T00:00:00Z`);
  const to = Date.parse(`${endDate}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / 86_400_000);
}

/**
 * Схема публичной заявки из калькулятора.
 * Цену, залог и текст заявки считает только сервер — клиентские значения игнорируются.
 */
export const rentRequestSchema = z
  .object({
    carId: z.string().min(1, "Не выбрано авто").max(64),
    name: z.string().trim().min(1, "Укажите имя").max(100, "Имя слишком длинное"),
    phone: z.string().trim().max(30, "Телефон слишком длинный").nullish(),
    email: z.string().trim().max(120, "Email слишком длинный").nullish(),
    startDate: z.string().refine(isRealDate, "Некорректная дата начала"),
    endDate: z.string().refine(isRealDate, "Некорректная дата окончания"),
    extraIds: z.array(z.string().min(1).max(64)).max(20, "Слишком много опций").optional(),
  })
  .superRefine((value, ctx) => {
    const phone = value.phone?.trim();
    const email = value.email?.trim();
    if (!phone && !email) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Укажите телефон или email" });
    }
    if (email && !EMAIL_RE.test(email)) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Некорректный email" });
    }
    if (daysBetween(value.startDate, value.endDate) <= 0) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "Дата окончания должна быть позже начала" });
    }
  });

export type RentRequestInput = z.infer<typeof rentRequestSchema>;

export function firstValidationError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Некорректные данные";
}

interface QuoteCar {
  priceDay?: number | null;
  price7Days?: number | null;
  classDeposit?: number | null;
  rentType?: { slug: string } | null;
}

interface QuoteExtra {
  name: string;
  price: number;
  priceType: "perDay" | "perRental";
}

/** Итог аренды: база по тарифным ступеням + опции, залог из класса. */
export function quoteRent(params: {
  car: QuoteCar;
  days: number;
  tiers: RentPricingTier[];
  extras: QuoteExtra[];
}) {
  const isTaxi = params.car.rentType?.slug === "taxi";
  const base = calculateRentPrice(params.car, params.days, params.tiers, isTaxi);
  const extrasTotal = params.extras.reduce(
    (sum, extra) => sum + (extra.priceType === "perDay" ? extra.price * params.days : extra.price),
    0,
  );

  return {
    isTaxi,
    days: params.days,
    base,
    extrasTotal,
    total: base + extrasTotal,
    deposit: params.car.classDeposit ?? 0,
    extrasLabel: params.extras.map(extra => extra.name).join(", "),
  };
}
