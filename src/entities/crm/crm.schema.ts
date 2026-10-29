import { z } from "zod";

export const LEAD_SOURCES = ["contact", "rent", "sale", "autopodbor"] as const;

const trimmed = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).transform(value => value || undefined);

export const leadMetaSchema = z.object({
  source: z.enum(LEAD_SOURCES),
  leadId: z.string().trim().min(1).max(100),
  assignedToId: z.string().trim().max(100).nullable().optional(),
  rejectionReason: trimmed(500),
  nextContactAt: z.string().trim().max(40).optional().or(z.literal("")).transform(value => value || undefined),
  internalNote: trimmed(5000),
});

export const leadNoteSchema = z.object({
  source: z.enum(LEAD_SOURCES),
  leadId: z.string().trim().min(1).max(100),
  text: z.string().trim().min(1, "Введите текст заметки").max(5000),
});

export const leadTaskSchema = z.object({
  source: z.enum(LEAD_SOURCES),
  leadId: z.string().trim().max(100).optional().or(z.literal("")).transform(value => value || undefined),
  clientPhone: trimmed(40),
  title: z.string().trim().min(1, "Введите задачу").max(300),
  dueAt: z.string().trim().max(40).optional().or(z.literal("")).transform(value => value || undefined),
  assignedToId: z.string().trim().max(100).optional().or(z.literal("")).transform(value => value || undefined),
});

export const leadTaskUpdateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["open", "done"]).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  dueAt: z.string().trim().max(40).nullable().optional(),
  assignedToId: z.string().trim().max(100).nullable().optional(),
});
