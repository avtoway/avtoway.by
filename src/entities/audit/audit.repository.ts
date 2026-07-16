import type { AuditLog } from "./audit";

export interface AuditLogRepository {
  getAll(filters?: { action?: string; entity?: string; search?: string; limit?: number }): Promise<AuditLog[]>;
  create(data: { userId: string; action: string; entity: string; entityId: string; details?: Record<string, unknown> }): Promise<void>;
}
