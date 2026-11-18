import { z } from "zod";

/** Пароль сотрудника: длина, буквы и цифры. */
const StrongPassword = z.string()
  .min(10, "Пароль от 10 символов")
  .max(128, "Слишком длинный пароль")
  .regex(/[a-zа-яё]/i, "Добавьте хотя бы одну букву")
  .regex(/\d/, "Добавьте хотя бы одну цифру");

export const UserCreateSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100),
  login: z.string().min(2, "Логин от 2 символов").max(50).regex(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _"),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  password: StrongPassword,
  roleIds: z.array(z.string()).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100).optional(),
  login: z.string().min(2, "Логин от 2 символов").max(50).regex(/^[a-zA-Z0-9_]+$/, "Только буквы, цифры и _").optional(),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  password: StrongPassword.optional(),
  roleIds: z.array(z.string()).optional(),
  newPassword: StrongPassword.optional().or(z.literal("")),
  oldPassword: z.string().optional(),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100),
  email: z.string().email("Некорректный email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  telegram: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  hireDate: z.string().optional().or(z.literal("")),
  workSchedule: z.enum(["full_time", "part_time", "shift", "freelance"]).optional(),
  bio: z.string().max(500, "Максимум 500 символов").optional().or(z.literal("")),
  photo: z.string().optional().or(z.literal("")),
});

export const PasswordChangeSchema = z.object({
  oldPassword: z.string().min(1, "Введите текущий пароль"),
  newPassword: StrongPassword,
  confirmPassword: z.string().min(1, "Подтвердите пароль"),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Новые пароли не совпадают",
  path: ["confirmPassword"],
});

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;
