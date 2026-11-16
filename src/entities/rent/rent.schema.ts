import { z } from "zod";

/**
 * Схемы валидации для админских операций с арендой.
 * Ограничивают набор полей (защита от mass-assignment) и проверяют диапазоны.
 */

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    // Пустая строка означает «очистить поле», поэтому превращаем её в null.
    .transform(value => (value === "" ? null : value));

const int = (min: number, max: number) =>
  z.number().int().min(min).max(max).nullable().optional();

const slug = z
  .string()
  .trim()
  .min(1, "Укажите slug")
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: только латиница, цифры и дефис");

export const rentCarInputSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(200),
  slug,
  brandId: text(64),
  modelId: text(64),
  classId: text(64),
  year: int(1950, 2100),
  color: text(60),
  transmission: text(40),
  fuel: text(40),
  engineVolume: text(20),
  seats: int(1, 60),
  features: text(2000),
  photos: text(20000),
  mainPhoto: text(1000),
  description: text(10000),
  taxiRequirements: text(3000),
  priceDay: int(0, 1_000_000),
  price7Days: int(0, 1_000_000),
  priceDayTaxi: int(0, 1_000_000),
  rentTypeId: text(64),
  isActive: z.boolean().optional(),
  bookedUntil: text(40),
  sortOrder: int(0, 100_000),
  conditions: z
    .array(
      z.object({
        conditionId: z.string().trim().min(1),
        value: z.string().max(500).optional().default(""),
      }),
    )
    .max(50)
    .optional(),
});

export const rentCarUpdateSchema = rentCarInputSchema.partial();

export const rentClassSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(100),
  slug,
  sortOrder: int(0, 100_000),
  deposit: int(0, 1_000_000),
  minAge: int(16, 99),
});

export const rentExtraSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(200),
  slug,
  description: text(1000),
  priceType: z.enum(["perDay", "perRental"]).optional(),
  price: int(0, 1_000_000),
  isActive: z.boolean().optional(),
  sortOrder: int(0, 100_000),
});

export const rentConditionSchema = z.object({
  name: z.string().trim().min(1, "Укажите название").max(200),
  slug,
  placeholder: text(300),
  sortOrder: int(0, 100_000),
});

export const rentPricingTierSchema = z.object({
  minDays: z.number().int().min(1, "Минимум 1 день").max(3650),
  maxDays: z.number().int().min(1).max(3650).nullable().optional(),
  discount: z.number().int().min(0).max(100),
  sortOrder: int(0, 100_000),
});

export const rentHistoryEntrySchema = z.object({
  type: z.string().trim().min(1, "Укажите тип записи").max(60),
  description: text(2000),
  amount: int(-100_000_000, 100_000_000),
  date: z.string().trim().min(1, "Укажите дату").max(40),
});

export const contactInfoSchema = z.object({
  phone: text(60),
  email: text(200),
  telegram: text(300),
  viber: text(60),
  whatsapp: text(60),
  instagram: text(300),
  youtube: text(300),
  rutube: text(300),
  vk: text(300),
  address: text(300),
  workingHours: text(200),
});
