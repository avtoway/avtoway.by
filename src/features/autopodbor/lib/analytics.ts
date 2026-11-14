import { trackEvent as trackBase } from "@/shared/lib/analytics";

type EventPayload = Record<string, unknown>;

/**
 * Отправляет событие в GTM/GA4, Яндекс.Метрику и CustomEvent.
 * Раньше дублировал логику dataLayer, теперь использует общий трекер.
 */
export function trackEvent(name: string, params: EventPayload = {}): void {
  if (typeof window === "undefined") return;
  trackBase(name, params);
  window.dispatchEvent(new CustomEvent("autopodbor:event", { detail: { name, ...params } }));
}

/** Выбирает услугу и скроллит к форме. */
export function selectService(slug: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("autopodbor:service", { detail: { slug } }));
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
