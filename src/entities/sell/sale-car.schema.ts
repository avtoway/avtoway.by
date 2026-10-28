import { z } from "zod";

const optionalText = (max = 2000) =>
  z.string().trim().max(max).optional().or(z.literal(""));

const bool = z.boolean().optional();

export const saleStatusSchema = z.enum(["available", "reserved", "sold", "draft"]);
export const saleRequestTypeSchema = z.enum(["buy", "trade_in", "sell_own"]);
export const saleRequestStatusSchema = z.enum(["new", "in_progress", "completed", "rejected"]);

export const customSpecSchema = z.object({
  label: z.string().trim().min(1, "Укажите название характеристики").max(80),
  value: z.string().trim().min(1, "Укажите значение").max(200),
});

export const saleCarCreateSchema = z.object({
  title: z.string().trim().min(3, "Укажите название объявления").max(200),
  slug: z.string().trim().regex(/^[a-z0-9-]+$/, "Slug: только латиница, цифры и дефисы").min(2).max(120),
  brandId: optionalText(80),
  modelId: optionalText(80),
  generation: optionalText(80),

  priceUsd: z.coerce.number().int().min(1, "Укажите цену в USD"),
  priceByn: z.coerce.number().int().min(1).optional().nullable(),
  oldPriceUsd: z.coerce.number().int().min(1).optional().nullable(),
  isNegotiable: bool,
  allowExchange: bool,
  allowCredit: bool,

  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000),
  bodyType: z.string().trim().min(1, "Выберите кузов").max(40),
  transmission: z.string().trim().min(1, "Выберите коробку").max(40),
  fuel: z.string().trim().min(1, "Выберите топливо").max(40),
  engineVolume: z.coerce.number().min(0).max(10).optional().nullable(),
  enginePowerHp: z.coerce.number().int().min(1).max(2000).optional().nullable(),
  driveType: z.string().trim().min(1, "Выберите привод").max(20),
  color: optionalText(60),
  interiorMaterial: optionalText(40),
  interiorColor: optionalText(40),
  steering: z.enum(["left", "right"]).optional(),
  seats: z.coerce.number().int().min(1).max(60).optional().nullable(),
  doors: z.coerce.number().int().min(1).max(10).optional().nullable(),

  condition: z.enum(["used", "new", "damaged"]).optional(),
  ownersCount: optionalText(10),
  originCountry: optionalText(60),
  customsCleared: bool,
  vin: optionalText(30),
  vinVerified: bool,
  originalPaint: bool,
  noAccidents: bool,
  serviceBook: bool,

  isInspected: bool,
  expertSummary: optionalText(1200),
  bodyCheckNote: optionalText(1000),
  techCheckNote: optionalText(1000),
  legalCheckNote: optionalText(1000),
  diagnosticsPdf: optionalText(500),

  features: z.array(z.string().trim().min(1).max(120)).max(200).optional(),
  customSpecs: z.array(customSpecSchema).max(40).optional(),
  description: optionalText(20_000),
  mainPhoto: optionalText(500),
  photos: z.array(z.string().trim().min(1).max(500)).max(40).optional(),
  videoUrl: optionalText(500),

  city: z.string().trim().min(1).max(80).optional(),
  contactName: optionalText(100),
  contactPhone: optionalText(40),

  status: saleStatusSchema.optional(),
  isFeatured: bool,
  isActive: bool,
  sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),

  seoTitle: optionalText(200),
  seoDescription: optionalText(400),
});

export const saleCarUpdateSchema = saleCarCreateSchema.partial();

export const saleRequestSchema = z.object({
  type: saleRequestTypeSchema.default("buy"),
  carId: z.string().uuid().optional().or(z.literal("")),
  clientName: z.string().trim().min(2, "Укажите имя").max(100),
  clientPhone: z.string().trim().min(6, "Укажите телефон").max(40),
  carInfo: optionalText(500),
  offerPrice: z.coerce.number().int().min(0).max(10_000_000).optional().nullable(),
  comment: optionalText(2000),
  company: z.string().max(0).optional(),
});

export const saleRequestStatusUpdateSchema = z.object({
  status: saleRequestStatusSchema,
});
