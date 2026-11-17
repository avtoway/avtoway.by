import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const promotionChannelSchema = z.enum([
  "google_ads",
  "yandex_direct",
  "youtube",
  "instagram",
  "tiktok",
  "telegram",
  "other",
]);

export const campaignStatusSchema = z.enum(["planned", "active", "paused", "finished"]);

export const promotionCampaignInputSchema = z.object({
  title: z.string().trim().min(2, "Укажите название кампании").max(160),
  channel: promotionChannelSchema,
  status: campaignStatusSchema.optional(),
  budget: z.coerce.number().int().min(0).max(1_000_000_000).optional().nullable(),
  spend: z.coerce.number().int().min(0).max(1_000_000_000).optional().nullable(),
  startDate: optionalText(40),
  endDate: optionalText(40),
  targetUrl: optionalText(1000),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(120),
  notes: optionalText(4000),
});

export const promotionCampaignUpdateSchema = promotionCampaignInputSchema.partial();

export const adSlotInputSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, "Укажите ключ слота")
    .max(60)
    .regex(/^[a-z0-9_]+$/, "Ключ: только латиница, цифры и подчёркивание"),
  title: z.string().trim().min(2, "Укажите название блока").max(160),
  placement: z.string().trim().min(2).max(80),
  html: optionalText(50_000),
  imageUrl: optionalText(1000),
  targetUrl: optionalText(1000),
  height: z.coerce.number().int().min(50).max(1200).optional(),
  isActive: z.boolean().optional(),
  startsAt: optionalText(40),
  endsAt: optionalText(40),
});

export const adSlotUpdateSchema = adSlotInputSchema.partial();
