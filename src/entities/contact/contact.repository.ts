import type { ContactRequest } from "./contact";

export interface ContactRepository {
  create(data: Omit<ContactRequest, "id" | "createdAt">): Promise<ContactRequest>;
}
