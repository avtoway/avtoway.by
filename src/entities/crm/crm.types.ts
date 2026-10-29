export type LeadSource = "contact" | "rent" | "sale" | "autopodbor";

export interface LeadMeta {
  id: string;
  source: LeadSource;
  leadId: string;
  assignedToId?: string;
  rejectionReason?: string;
  nextContactAt?: string;
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  source: LeadSource;
  leadId: string;
  userId?: string;
  author?: string;
  text: string;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  source: LeadSource;
  leadId?: string;
  clientPhone?: string;
  title: string;
  dueAt?: string;
  status: "open" | "done" | string;
  assignedToId?: string;
  createdById?: string;
  createdAt: string;
  completedAt?: string;
  leadName?: string;
  leadPhone?: string;
}

export interface CrmLead {
  source: LeadSource;
  id: string;
  name: string;
  phone?: string;
  email?: string;
  summary: string;
  status: string;
  createdAt: string;
  serviceLabel?: string;
  href?: string;
}

export interface CrmClientSummary {
  phone: string;
  name: string;
  email?: string;
  total: number;
  newCount: number;
  sources: LeadSource[];
  lastAt: string;
}

export interface CrmClient {
  phone: string;
  name: string;
  email?: string;
  leads: CrmLead[];
}

export interface CrmAssignee {
  id: string;
  name: string;
  login: string;
}
