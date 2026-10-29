import { z } from "zod";

const LONG_TEXT = 20_000;

const optionalText = (max = 500) =>
  z.string().max(max, `Максимум ${max} символов`).optional().or(z.literal(""));

const optionalNumber = z
  .number()
  .int("Введите целое число")
  .min(0, "Число не может быть отрицательным")
  .max(10_000_000, "Слишком большое значение")
  .optional()
  .nullable();

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
] as const;

export const WORK_FORMATS = ["office", "hybrid", "remote"] as const;

export const SALARY_PERIODS = ["month", "hour", "shift", "project"] as const;

export const SALARY_TYPES = ["fixed", "piecework", "negotiable"] as const;

export const VacancySchema = z.object({
  slug: z
    .string()
    .min(1, "Slug обязателен")
    .max(80, "Максимум 80 символов")
    .regex(/^[a-z0-9-]+$/, "Только латиница, цифры и дефис"),
  title: z.string().min(1, "Название обязательно").max(150, "Максимум 150 символов"),
  department: optionalText(100),
  location: optionalText(100),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  workFormat: z.enum(WORK_FORMATS).optional().or(z.literal("")),
  experience: optionalText(100),
  schedule: optionalText(100),
  salaryFrom: optionalNumber,
  salaryTo: optionalNumber,
  salaryCurrency: z.string().max(10).optional().or(z.literal("")),
  salaryPeriod: z.enum(SALARY_PERIODS).optional(),
  salaryType: z.enum(SALARY_TYPES).optional(),
  salaryNote: optionalText(200),
  shortDescription: z
    .string()
    .min(1, "Короткое описание обязательно")
    .max(300, "Максимум 300 символов"),
  description: optionalText(LONG_TEXT),
  responsibilities: optionalText(LONG_TEXT),
  requirements: optionalText(LONG_TEXT),
  conditions: optionalText(LONG_TEXT),
  benefits: optionalText(LONG_TEXT),
  contactName: optionalText(100),
  contactPhone: optionalText(50),
  contactEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  contactTelegram: optionalText(200),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  publishedAt: z.string().optional().or(z.literal("")),
});

export type VacancyFormInput = z.infer<typeof VacancySchema>;
