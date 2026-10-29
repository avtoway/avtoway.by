import type { CrmAssignee, CrmClient, CrmClientSummary, LeadMeta, LeadNote, LeadSource, LeadTask } from "./crm.types";

export interface LeadTaskFilters {
  status?: string;
  source?: string;
  leadId?: string;
  clientPhone?: string;
}

export interface CrmRepository {
  getMeta(source: LeadSource, leadId: string): Promise<LeadMeta | null>;
  upsertMeta(source: LeadSource, leadId: string, data: {
    assignedToId?: string | null;
    rejectionReason?: string | null;
    nextContactAt?: string | null;
    internalNote?: string | null;
  }): Promise<LeadMeta>;
  getNotes(source: LeadSource, leadId: string): Promise<LeadNote[]>;
  addNote(source: LeadSource, leadId: string, text: string, userId?: string, author?: string): Promise<LeadNote>;
  getTasks(filters?: LeadTaskFilters): Promise<LeadTask[]>;
  createTask(data: {
    source: LeadSource;
    leadId?: string;
    clientPhone?: string;
    title: string;
    dueAt?: string;
    assignedToId?: string;
    createdById?: string;
  }): Promise<LeadTask>;
  updateTask(id: string, data: { status?: string; title?: string; dueAt?: string | null; assignedToId?: string | null }): Promise<LeadTask>;
  deleteTask(id: string): Promise<void>;
  getClients(search?: string): Promise<CrmClientSummary[]>;
  getClient(phone: string): Promise<CrmClient | null>;
  advanceLeadStatus(source: LeadSource, leadId: string): Promise<void>;
  getAssignees(): Promise<CrmAssignee[]>;
}
