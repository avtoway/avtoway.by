export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  userName?: string;
  userLogin?: string;
}
