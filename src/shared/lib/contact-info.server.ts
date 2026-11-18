import "server-only";
import { cache } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { ContactInfo } from "@/entities/contact/contact-info.types";

/**
 * Контакты запрашиваются в шапке, футере, главной и JSON-LD.
 * cache() схлопывает их в один запрос на рендер страницы.
 */
export const getCachedContactInfo = cache(async (): Promise<ContactInfo | null> => {
  try {
    return await container.get<ContactInfoRepository>("ContactInfoRepository").get();
  } catch {
    return null;
  }
});
