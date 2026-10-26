export interface ContactRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status: string;
  createdAt: string;
}

export type ContactRequestStatus = "new" | "in_progress" | "done" | "archived";
