export interface LeadAttribution {
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export function getLeadAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    pageUrl: window.location.href,
    utmSource: params.get("utm_source")?.trim() || undefined,
    utmMedium: params.get("utm_medium")?.trim() || undefined,
    utmCampaign: params.get("utm_campaign")?.trim() || undefined,
  };
}
