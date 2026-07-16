import { getPrismaClient } from "./prisma.client";
import type { AuditLogRepository } from "@/entities/audit/audit.repository";
import type { AuditLog } from "@/entities/audit/audit";
import { randomUUID } from "node:crypto";

function toAuditLog(row: any): AuditLog {
  return {
    id: row.id,
    userId: row.userId,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    details: row.details,
    createdAt: row.createdAt?.toISOString?.() ?? row.createdAt,
    userName: (row.user?.profile?.name || row.user?.login || undefined) as string | undefined,
    userLogin: (row.user?.login || undefined) as string | undefined,
  };
}

export class PrismaAuditLogRepository implements AuditLogRepository {
  private get db() { return getPrismaClient(); }

  async getAll(filters?: { action?: string; entity?: string; search?: string; limit?: number }): Promise<AuditLog[]> {
    const where: Record<string, unknown> = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.entity) where.entity = filters.entity;
    if (filters?.search) {
      where.OR = [
        { userId: { contains: filters.search } },
        { entityId: { contains: filters.search } },
      ];
    }
    const rows = await this.db.auditLog.findMany({
      where: where as any,
      include: { user: { include: { profile: true } } },
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 100,
    });
    return rows.map(toAuditLog);
  }

  async create(data: { userId: string; action: string; entity: string; entityId: string; details?: Record<string, unknown> }): Promise<void> {
    await this.db.auditLog.create({
      data: {
        id: randomUUID(),
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details ? JSON.stringify(data.details) : null,
      },
    });
  }
}