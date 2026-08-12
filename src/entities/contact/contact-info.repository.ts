import type { ContactInfo } from "./contact-info.types";

export interface ContactInfoRepository {
  get(): Promise<ContactInfo | null>;
  update(data: Partial<ContactInfo>): Promise<ContactInfo>;
}
