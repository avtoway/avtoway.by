export interface ContactRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  source: string;
  serviceSlug?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: string;
  createdAt: string;
}

export type ContactRequestStatus = "new" | "in_progress" | "done" | "archived";
