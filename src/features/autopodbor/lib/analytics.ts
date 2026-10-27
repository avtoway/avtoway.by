type EventPayload = Record<string, unknown>;

/**
 * Аналитика без жёсткой привязки к GTM/Метрике: если dataLayer есть — пишем туда,
 * всегда дублируем CustomEvent, чтобы можно было слушать из любого места.
 */
export function trackEvent(name: string, params: EventPayload = {}): void {
  if (typeof window === "undefined") return;

  const w = window as Window & { dataLayer?: EventPayload[]; ym?: (...args: unknown[]) => void };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({ event: name, ...params });
  }
  window.dispatchEvent(new CustomEvent("autopodbor:event", { detail: { name, ...params } }));
}

/** Прокрутить к форме и подсветить выбранный тариф. */
export function selectService(slug: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("autopodbor:service", { detail: { slug } }));
  document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}
