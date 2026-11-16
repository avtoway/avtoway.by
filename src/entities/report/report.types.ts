export type ReportVerdict = "recommended" | "caution" | "reject";
export type ReportCheckStatus = "ok" | "attention" | "critical";

export interface ReportChecklistItem {
  category: string;
  title: string;
  status: ReportCheckStatus;
  note?: string;
}

export interface ReportExpense {
  label: string;
  amount: number;
}

export interface InspectionReport {
  id: string;
  token: string;
  leadId?: string;
  clientName?: string;
  clientPhone?: string;
  carTitle: string;
  vin?: string;
  mileageKm?: number;
  inspectedAt?: string;
  verdict: ReportVerdict;
  summary?: string;
  checklist: ReportChecklistItem[];
  expenses: ReportExpense[];
  photos: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionReportInput {
  leadId?: string;
  clientName?: string;
  clientPhone?: string;
  carTitle: string;
  vin?: string;
  mileageKm?: number | null;
  inspectedAt?: string;
  verdict?: ReportVerdict;
  summary?: string;
  checklist?: ReportChecklistItem[];
  expenses?: ReportExpense[];
  photos?: string[];
  isPublished?: boolean;
}
