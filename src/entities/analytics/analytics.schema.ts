import { z } from "zod";

const trimmed = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform(value => value ?? "");

export const analyticsSettingsSchema = z.object({
  gaId: z
    .string()
    .trim()
    .max(40)
    .refine(value => !value || /^(G|GT|UA|AW)-[A-Z0-9-]+$/i.test(value), "Некорректный Google ID")
    .optional()
    .or(z.literal("")),
  ymId: z
    .string()
    .trim()
    .max(20)
    .refine(value => !value || /^\d+$/.test(value), "Номер счётчика Яндекс.Метрики должен содержать только цифры")
    .optional()
    .or(z.literal("")),
  ymWebvisor: z.boolean().optional(),
  googleVerification: trimmed(300),
  yandexVerification: trimmed(300),
  seoTitle: trimmed(200),
  seoDescription: trimmed(600),
  ogImage: trimmed(500),
  noindex: z.boolean().optional(),
});
