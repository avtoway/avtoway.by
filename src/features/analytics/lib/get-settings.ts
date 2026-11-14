import "server-only";
import { cache } from "react";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { AnalyticsRepository } from "@/entities/analytics/analytics.repository";
import type { AnalyticsSettings } from "@/entities/analytics/analytics.types";

export const getAnalyticsSettings = cache(async (): Promise<AnalyticsSettings | null> => {
  try {
    return await container.get<AnalyticsRepository>("AnalyticsRepository").getSettings();
  } catch {
    return null;
  }
});
