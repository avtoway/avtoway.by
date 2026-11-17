import "server-only";
import { cache } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Service } from "@/entities/service/service.types";

/**
 * Активные услуги из БД — единственный источник правды для публичных блоков.
 * Если услугу скрыли в админке, она исчезает из меню, тикера, карточек и CTA.
 */
export const getActiveServices = cache(async (): Promise<Service[]> => {
  try {
    return await container.get<ServiceRepository>("ServiceRepository").getActive();
  } catch {
    // Не роняем страницу, если БД временно недоступна.
    return [];
  }
});
