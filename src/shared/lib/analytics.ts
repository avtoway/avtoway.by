type AnalyticsParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsParams[];
    gtag?: (...args: unknown[]) => void;
    ym?: (...args: unknown[]) => void;
    __avtowayYmId?: string;
  }
}

export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({ event: name, ...params });
  window.gtag?.("event", name, params);
  if (window.__avtowayYmId && window.ym) {
    window.ym(window.__avtowayYmId, "reachGoal", name, params);
  }
}

export function trackLead(source: string, params: AnalyticsParams = {}): void {
  trackEvent("lead_submit", { lead_source: source, ...params });
}
