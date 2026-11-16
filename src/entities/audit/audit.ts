export interface AuditLog {
  id: string;
  /** Может быть пустым, если сотрудник удалён (onDelete: SetNull). */
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  userName?: string;
  userLogin?: string;
}
