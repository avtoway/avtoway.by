export interface AnalyticsSettings {
  gaId: string;
  ymId: string;
  ymWebvisor: boolean;
  googleVerification: string;
  yandexVerification: string;
  seoTitle: string;
  seoDescription: string;
  ogImage: string;
  noindex: boolean;
}

export interface AnalyticsCount {
  key: string;
  label: string;
  count: number;
  newCount: number;
}

export interface AnalyticsDay {
  date: string;
  label: string;
  count: number;
}

export interface AnalyticsUtm {
  source: string;
  medium: string;
  campaign: string;
  count: number;
}

export interface AnalyticsPage {
  page: string;
  count: number;
}

export interface AnalyticsOverview {
  days: number;
  since: string;
  total: number;
  newCount: number;
  inWorkCount: number;
  doneCount: number;
  bySource: AnalyticsCount[];
  byService: AnalyticsCount[];
  byDay: AnalyticsDay[];
  byUtm: AnalyticsUtm[];
  topPages: AnalyticsPage[];
}
