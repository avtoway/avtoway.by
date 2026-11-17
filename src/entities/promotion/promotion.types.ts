export type PromotionChannel =
  | "google_ads"
  | "yandex_direct"
  | "youtube"
  | "instagram"
  | "tiktok"
  | "telegram"
  | "other";

export type CampaignStatus = "planned" | "active" | "paused" | "finished";

export interface PromotionCampaign {
  id: string;
  title: string;
  channel: PromotionChannel;
  status: CampaignStatus;
  budget?: number;
  spend?: number;
  startDate?: string;
  endDate?: string;
  targetUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PromotionCampaignInput = Omit<
  PromotionCampaign,
  "id" | "createdAt" | "updatedAt" | "budget" | "spend"
> & {
  budget?: number | null;
  spend?: number | null;
};

export interface AdSlot {
  id: string;
  key: string;
  title: string;
  placement: string;
  html?: string;
  imageUrl?: string;
  targetUrl?: string;
  height: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

export type AdSlotInput = Omit<AdSlot, "id" | "impressions" | "clicks" | "createdAt" | "updatedAt">;

export const PROMOTION_CHANNELS: Array<{ value: PromotionChannel; label: string }> = [
  { value: "google_ads", label: "Google Ads" },
  { value: "yandex_direct", label: "Яндекс Директ" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "telegram", label: "Telegram" },
  { value: "other", label: "Другое" },
];

export const CAMPAIGN_STATUSES: Array<{ value: CampaignStatus; label: string }> = [
  { value: "planned", label: "Планируется" },
  { value: "active", label: "Активна" },
  { value: "paused", label: "Пауза" },
  { value: "finished", label: "Завершена" },
];

export const AD_PLACEMENTS: Array<{ value: string; label: string }> = [
  { value: "home_top", label: "Главная — под hero" },
  { value: "home_bottom", label: "Главная — перед футером" },
  { value: "services_bottom", label: "Каталог услуг — внизу" },
  { value: "blog_inline", label: "Статья блога — после текста" },
  { value: "works_bottom", label: "Наши работы — внизу" },
  { value: "global_footer", label: "Футер — на всех страницах" },
];
