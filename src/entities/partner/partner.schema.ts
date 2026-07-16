import { z } from "zod";

const URL_OR_EMPTY = z.string().optional().or(z.literal(""));

export const PartnerSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100),
  photo: URL_OR_EMPTY,
  photos: z.array(z.string()).optional(),
  description: z.string().max(500, "Максимум 500 символов").optional().or(z.literal("")),
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
