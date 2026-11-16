import type { LeadSource } from "./crm.types";

/**
 * Какие права дают доступ к заявкам конкретного источника.
 * Используется и в UI, и в API, чтобы не терять заявки и не показывать лишнего.
 */
export const LEAD_SOURCE_PERMISSIONS: Record<LeadSource, string[]> = {
  contact: ["contacts.manage"],
  rent: ["rent.manage"],
  sale: ["sell.manage"],
  autopodbor: ["autopodbor.requests", "autopodbor.manage", "autopodbor.view"],
};

export const LEAD_SOURCES_ORDER: LeadSource[] = ["contact", "rent", "sale", "autopodbor"];

export function allowedLeadSources(permissions: string[]): LeadSource[] {
  return LEAD_SOURCES_ORDER.filter(source =>
    LEAD_SOURCE_PERMISSIONS[source].some(permission => permissions.includes(permission)),
  );
}

export function canAccessLeadSource(permissions: string[], source: LeadSource): boolean {
  return LEAD_SOURCE_PERMISSIONS[source].some(permission => permissions.includes(permission));
}

/** Любое право, дающее доступ хотя бы к одной заявке. */
export const ANY_LEAD_ACCESS_PERMISSIONS: string[] = [
  ...new Set(Object.values(LEAD_SOURCE_PERMISSIONS).flat()),
];
