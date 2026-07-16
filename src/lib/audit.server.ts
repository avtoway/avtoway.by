import "@/di/composition-root";
import { container } from "@/di/container";
import type { AuditLogRepository } from "@/entities/audit/audit.repository";

export async function createAuditLog(params: {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: string;
  entityId: string;
  details?: unknown;
}) {
  try {
    const repo = container.get<AuditLogRepository>("AuditLogRepository");
    await repo.create({
      userId: params.userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details as Record<string, unknown> | undefined,
    });
  } catch {
    // Don't fail if audit logging fails
  }
}
