import { z } from "zod";

const ICONS = ["youtube", "car", "check-circle", "dollar"] as const;

export const ServiceSchema = z.object({
  slug: z.string().min(1, "Slug обязателен").max(50).regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().min(1, "Название обязательно").max(100),
  desc: z.string().max(300, "Максимум 300 символов").optional().or(z.literal("")),
  href: z.string().min(1, "Ссылка обязательна"),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Некорректный hex-цвет"),
  iconName: z.enum(ICONS).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type ServiceInput = z.infer<typeof ServiceSchema>;
