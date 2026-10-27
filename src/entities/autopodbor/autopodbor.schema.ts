import { z } from "zod";

/* ─── helpers ─── */

const trimmed = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform(v => (v ? v : undefined));

const optionalInt = (min = 0, max = 1_000_000) =>
  z.preprocess(
    v => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(min).max(max).optional(),
  );

const bool = () => z.boolean().optional();

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PHONE_RE = /^[+\d\s()\-]+$/;

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "options_sent",
  "meeting",
  "done",
  "cancelled",
  "spam",
] as const;

export const TARIFF_GROUPS = ["rb", "abroad", "extra"] as const;
export const FEATURE_TYPES = ["risk", "advantage", "guarantee", "trust"] as const;
export const CHECK_CATEGORIES = ["body", "engine", "chassis", "electronics", "interior", "legal"] as const;
export const REVIEW_SOURCES = ["site", "yandex", "google", "telegram"] as const;

/* ─── публичная заявка ─── */

export const autopodborLeadSchema = z
  .object({
    name: z.string().trim().min(2, "Укажите имя").max(50, "Имя слишком длинное"),
    phone: z
      .string()
      .trim()
      .min(7, "Укажите телефон")
      .max(20, "Телефон слишком длинный")
      .regex(PHONE_RE, "Некорректный телефон"),
    email: z
      .string()
      .trim()
      .max(100)
      .refine(v => !v || EMAIL_RE.test(v), "Некорректный email")
      .optional()
      .or(z.literal("")),
    messenger: z.enum(["telegram", "whatsapp", "viber", "call"]).optional(),
    city: trimmed(60),
    budgetFrom: optionalInt(),
    budgetTo: optionalInt(),
    brand: trimmed(60),
    model: trimmed(60),
    serviceSlug: trimmed(60),
    comment: trimmed(1000),
    consent: z.literal(true, { message: "Нужно согласие на обработку данных" }),
    source: z.enum(["quiz", "form", "callback"]).default("form"),
    quiz: z.record(z.string(), z.unknown()).optional(),
    company: z.string().max(0).optional(), // honeypot
    pageUrl: trimmed(500),
    utmSource: trimmed(100),
    utmMedium: trimmed(100),
    utmCampaign: trimmed(100),
  })
  .refine(v => v.budgetFrom == null || v.budgetTo == null || v.budgetFrom <= v.budgetTo, {
    message: "Бюджет «от» не может быть больше «до»",
    path: ["budgetTo"],
  });

export type AutoPodborLeadInput = z.infer<typeof autopodborLeadSchema>;

/* ─── админские сущности ─── */

export const settingsSchema = z.object({
  isActive: bool(),
  heroBadge: trimmed(160),
  heroTitle: z.string().trim().min(1).max(200).optional(),
  heroHighlight: trimmed(120),
  heroSubtitle: trimmed(1000),
  heroImage: trimmed(500),
  heroImageAlt: trimmed(300),
  priceFrom: optionalInt(),
  ctaPrimaryLabel: trimmed(60),
  ctaSecondaryLabel: trimmed(60),
  phone: trimmed(40),
  telegram: trimmed(200),
  whatsapp: trimmed(40),
  viber: trimmed(40),
  address: trimmed(200),
  workingHours: trimmed(120),
  yearsExperience: optionalInt(0, 100),
  carsChecked: optionalInt(0, 1_000_000),
  citiesCount: optionalInt(0, 1000),
  guaranteeDays: optionalInt(0, 3650),
  avgSavings: optionalInt(0, 1_000_000),
  reportTime: trimmed(60),
  expertName: trimmed(100),
  expertRole: trimmed(120),
  expertQuote: trimmed(1000),
  expertPhoto: trimmed(500),
  expertFacts: trimmed(1000),
  disclaimer: trimmed(1000),
  seoTitle: trimmed(200),
  seoDescription: trimmed(500),
  ogImage: trimmed(500),
  noindex: bool(),
});

export const sectionSchema = z.object({
  key: z.string().trim().min(1).max(60),
  badge: trimmed(160),
  title: trimmed(300),
  subtitle: trimmed(1000),
  description: trimmed(2000),
  image: trimmed(500),
  imageAlt: trimmed(300),
  isActive: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const tariffSchema = z.object({
  slug: z.string().trim().max(80).optional(),
  groupName: z.enum(TARIFF_GROUPS).optional(),
  title: z.string().trim().min(1, "Укажите название").max(160),
  subtitle: trimmed(300),
  description: trimmed(2000),
  price: optionalInt(),
  priceFrom: bool(),
  currency: trimmed(10),
  unit: trimmed(60),
  duration: trimmed(60),
  includes: trimmed(3000),
  badge: trimmed(120),
  icon: trimmed(40),
  image: trimmed(500),
  ctaLabel: trimmed(60),
  isPopular: bool(),
  isActive: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const stepSchema = z.object({
  title: z.string().trim().min(1, "Укажите название").max(160),
  description: trimmed(1000),
  duration: trimmed(60),
  icon: trimmed(40),
  sortOrder: optionalInt(0, 9999),
  isActive: bool(),
});

export const featureSchema = z.object({
  type: z.enum(FEATURE_TYPES).optional(),
  title: z.string().trim().min(1, "Укажите название").max(160),
  description: trimmed(1000),
  icon: trimmed(40),
  stat: trimmed(60),
  sortOrder: optionalInt(0, 9999),
  isActive: bool(),
});

export const checkSchema = z.object({
  category: z.enum(CHECK_CATEGORIES),
  title: z.string().trim().min(1, "Укажите название").max(200),
  description: trimmed(500),
  isCritical: bool(),
  sortOrder: optionalInt(0, 9999),
  isActive: bool(),
});

export const caseSchema = z.object({
  slug: z.string().trim().max(120).optional(),
  title: z.string().trim().min(1, "Укажите название").max(200),
  brand: trimmed(60),
  model: trimmed(60),
  year: optionalInt(1950, 2100),
  budget: optionalInt(),
  purchasePrice: optionalInt(),
  tradeAmount: optionalInt(),
  days: optionalInt(0, 365),
  city: trimmed(60),
  task: trimmed(500),
  found: trimmed(1000),
  result: trimmed(1000),
  photos: trimmed(4000),
  mainPhoto: trimmed(500),
  completedAt: trimmed(20),
  isActive: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const reviewSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  city: trimmed(60),
  car: trimmed(100),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  text: z.string().trim().min(5, "Слишком короткий отзыв").max(2000),
  source: z.enum(REVIEW_SOURCES).optional(),
  sourceUrl: trimmed(500),
  isPublished: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const faqSchema = z.object({
  question: z.string().trim().min(3, "Укажите вопрос").max(300),
  answer: z.string().trim().min(3, "Укажите ответ").max(3000),
  category: trimmed(60),
  sortOrder: optionalInt(0, 9999),
  isActive: bool(),
});

export const gallerySchema = z.object({
  section: z.string().trim().min(1).max(60),
  title: trimmed(160),
  alt: z.string().trim().min(1, "Укажите alt").max(300),
  photo: z.string().trim().min(1, "Загрузите фото").max(500),
  prompt: trimmed(2000),
  sortOrder: optionalInt(0, 9999),
  isActive: bool(),
});

export const citySchema = z.object({
  name: z.string().trim().min(1, "Укажите город").max(60),
  slug: z.string().trim().max(60).optional(),
  isActive: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const promoSchema = z.object({
  title: z.string().trim().min(1, "Укажите название").max(160),
  subtitle: trimmed(300),
  discount: trimmed(60),
  validUntil: trimmed(20),
  isActive: bool(),
  sortOrder: optionalInt(0, 9999),
});

export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  assignedToId: z.string().trim().max(64).nullable().optional(),
  internalNote: trimmed(2000),
  priceQuoted: optionalInt(),
});
