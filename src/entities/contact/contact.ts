export interface ContactRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  createdAt: Date;
}
