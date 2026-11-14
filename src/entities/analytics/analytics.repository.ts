import type { AnalyticsOverview, AnalyticsSettings } from "./analytics.types";

export interface AnalyticsRepository {
  getSettings(): Promise<AnalyticsSettings>;
  updateSettings(data: Partial<AnalyticsSettings>): Promise<AnalyticsSettings>;
  getOverview(days?: number): Promise<AnalyticsOverview>;
}
