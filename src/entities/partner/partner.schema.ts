import { z } from "zod";

const URL_OR_EMPTY = z.string().optional().or(z.literal(""));

export const PartnerSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .max(80, "Максимум 80 символов")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  name: z.string().min(1, "Название обязательно").max(100),
  photo: URL_OR_EMPTY,
  photos: z.array(z.string()).optional(),
  shortDescription: z
    .string()
    .min(1, "Короткое описание обязательно")
    .max(300, "Максимум 300 символов"),
  description: z.string().max(5000, "Максимум 5000 символов").optional().or(z.literal("")),
  services: z.string().max(5000, "Максимум 5000 символов").optional().or(z.literal("")),
  advantages: z.string().max(5000, "Максимум 5000 символов").optional().or(z.literal("")),
  workingHours: z.string().max(200, "Максимум 200 символов").optional().or(z.literal("")),
  phone: URL_OR_EMPTY,
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  contactPerson: z.string().max(100).optional().or(z.literal("")),
  website: URL_OR_EMPTY,
  instagram: URL_OR_EMPTY,
  telegram: URL_OR_EMPTY,
  vk: URL_OR_EMPTY,
  youtube: URL_OR_EMPTY,
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type PartnerInput = z.infer<typeof PartnerSchema>;
