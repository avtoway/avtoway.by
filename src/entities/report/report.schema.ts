import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const reportVerdictSchema = z.enum(["recommended", "caution", "reject"]);
export const reportCheckStatusSchema = z.enum(["ok", "attention", "critical"]);

export const reportChecklistItemSchema = z.object({
  category: z.string().trim().min(1, "Укажите категорию").max(80),
  title: z.string().trim().min(1, "Укажите пункт проверки").max(200),
  status: reportCheckStatusSchema,
  note: optionalText(500),
});

export const reportExpenseSchema = z.object({
  label: z.string().trim().min(1, "Укажите статью расходов").max(200),
  amount: z.coerce.number().int().min(0).max(1_000_000_000),
});

export const inspectionReportInputSchema = z.object({
  leadId: optionalText(64),
  clientName: optionalText(100),
  clientPhone: optionalText(40),
  carTitle: z.string().trim().min(2, "Укажите автомобиль").max(200),
  vin: optionalText(30),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000).optional().nullable(),
  inspectedAt: optionalText(40),
  verdict: reportVerdictSchema.optional(),
  summary: optionalText(5000),
  checklist: z.array(reportChecklistItemSchema).max(100).optional(),
  expenses: z.array(reportExpenseSchema).max(50).optional(),
  photos: z.array(z.string().trim().min(1).max(500)).max(40).optional(),
  isPublished: z.boolean().optional(),
});

export const inspectionReportUpdateSchema = inspectionReportInputSchema.partial();
