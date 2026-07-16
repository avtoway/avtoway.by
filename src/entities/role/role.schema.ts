import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(50),
  description: z.string().max(200, "Максимум 200 символов").optional().or(z.literal("")),
  level: z.number().int("Целое число").min(0, "Минимум 0").max(999, "Максимум 999"),
  permissions: z.array(z.string()).optional(),
});

export type RoleInput = z.infer<typeof RoleSchema>;
