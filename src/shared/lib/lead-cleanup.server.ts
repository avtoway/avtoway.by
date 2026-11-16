import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { LeadSource } from "@/entities/crm/crm.types";

/**
 * Удаляет CRM-«хвост» заявки: метаданные, заметки и задачи.
 * Вызывается при удалении заявки из любого модуля, чтобы не оставлять сирот.
 */
export async function deleteLeadCrmData(source: LeadSource, leadId: string): Promise<void> {
  const db = getPrismaClient();
  await db.$transaction([
    db.leadMeta.deleteMany({ where: { source, leadId } }),
    db.leadNote.deleteMany({ where: { source, leadId } }),
    db.leadTask.deleteMany({ where: { source, leadId } }),
  ]);
}
