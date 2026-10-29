import type { ContactRequest, ContactRequestStatus } from "./contact";

export interface ContactRepository {
  create(data: {
    name: string;
    phone?: string;
    email?: string;
    message: string;
    source?: string;
    serviceSlug?: string;
    pageUrl?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  }): Promise<ContactRequest>;
  getAll(): Promise<ContactRequest[]>;
  updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest>;
  delete(id: string): Promise<void>;
}
