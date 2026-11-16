import { getPrismaClient } from "./prisma.client";
import type { AnalyticsRepository } from "@/entities/analytics/analytics.repository";
import type {
  AnalyticsCount,
  AnalyticsDay,
  AnalyticsOverview,
  AnalyticsSettings,
  AnalyticsUtm,
} from "@/entities/analytics/analytics.types";

const KEYS = {
  gaId: "analytics_ga_id",
  ymId: "analytics_ym_id",
  ymWebvisor: "analytics_ym_webvisor",
  googleVerification: "analytics_google_verification",
  yandexVerification: "analytics_yandex_verification",
  seoTitle: "analytics_seo_title",
  seoDescription: "analytics_seo_description",
  ogImage: "analytics_og_image",
  noindex: "analytics_noindex",
} as const;

const DEFAULTS: AnalyticsSettings = {
  gaId: "",
  ymId: "",
  ymWebvisor: true,
  googleVerification: "",
  yandexVerification: "",
  seoTitle: "",
  seoDescription: "",
  ogImage: "",
  noindex: false,
};

const SERVICE_LABELS: Record<string, string> = {
  truck: "Эвакуатор",
  import: "Автопригон",
  service: "Автосервис",
  moving: "Грузоперевозки",
  rent: "Аренда",
  sell: "Продажа",
  inspection: "Автоподбор",
  vacancies: "Вакансии",
  contacts: "Контакты",
};

const SOURCE_LABELS: Record<string, string> = {
  contact: "Общие формы",
  rent: "Аренда",
  sale: "Продажа",
  autopodbor: "Автоподбор",
};

interface NormalizedLead {
  source: string;
  status: string;
  createdAt: Date;
  serviceKey: string;
  serviceLabel: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function bool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value === "true";
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  async getSettings(): Promise<AnalyticsSettings> {
    const rows = await getPrismaClient().setting.findMany({ where: { key: { in: Object.values(KEYS) } } });
    const map = Object.fromEntries(rows.map(row => [row.key, row.value]));
    return {
      gaId: map[KEYS.gaId] ?? DEFAULTS.gaId,
      ymId: map[KEYS.ymId] ?? DEFAULTS.ymId,
      ymWebvisor: bool(map[KEYS.ymWebvisor], DEFAULTS.ymWebvisor),
      googleVerification: map[KEYS.googleVerification] ?? "",
      yandexVerification: map[KEYS.yandexVerification] ?? "",
      seoTitle: map[KEYS.seoTitle] ?? "",
      seoDescription: map[KEYS.seoDescription] ?? "",
      ogImage: map[KEYS.ogImage] ?? "",
      noindex: bool(map[KEYS.noindex], DEFAULTS.noindex),
    };
  }

  async updateSettings(data: Partial<AnalyticsSettings>): Promise<AnalyticsSettings> {
    const db = getPrismaClient();
    const values: Array<[string, string]> = [];
    if (data.gaId !== undefined) values.push([KEYS.gaId, data.gaId]);
    if (data.ymId !== undefined) values.push([KEYS.ymId, data.ymId]);
    if (data.ymWebvisor !== undefined) values.push([KEYS.ymWebvisor, String(data.ymWebvisor)]);
    if (data.googleVerification !== undefined) values.push([KEYS.googleVerification, data.googleVerification]);
    if (data.yandexVerification !== undefined) values.push([KEYS.yandexVerification, data.yandexVerification]);
    if (data.seoTitle !== undefined) values.push([KEYS.seoTitle, data.seoTitle]);
    if (data.seoDescription !== undefined) values.push([KEYS.seoDescription, data.seoDescription]);
    if (data.ogImage !== undefined) values.push([KEYS.ogImage, data.ogImage]);
    if (data.noindex !== undefined) values.push([KEYS.noindex, String(data.noindex)]);

    if (values.length === 0) return this.getSettings();
    await db.$transaction(
      values.map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );
    return this.getSettings();
  }

  async getOverview(days = 30): Promise<AnalyticsOverview> {
    const db = getPrismaClient();
    const safeDays = Math.min(365, Math.max(1, days));
    const since = new Date();
    since.setDate(since.getDate() - safeDays + 1);
    since.setHours(0, 0, 0, 0);

    const [contacts, rents, sales, autos] = await Promise.all([
      db.contactRequest.findMany({
        where: { createdAt: { gte: since } },
        select: {
          status: true, createdAt: true, serviceSlug: true, pageUrl: true,
          utmSource: true, utmMedium: true, utmCampaign: true,
        },
        take: 5000,
      }),
      db.rentRequest.findMany({
        where: { createdAt: { gte: since } },
        select: { status: true, createdAt: true, car: { select: { name: true } } },
        take: 5000,
      }),
      db.saleRequest.findMany({
        where: { createdAt: { gte: since } },
        select: { status: true, createdAt: true, car: { select: { title: true } } },
        take: 5000,
      }),
      db.autoPodborLead.findMany({
        where: { createdAt: { gte: since } },
        select: {
          status: true, createdAt: true, serviceSlug: true, serviceTitle: true, pageUrl: true,
          utmSource: true, utmMedium: true, utmCampaign: true,
        },
        take: 5000,
      }),
    ]);

    const leads: NormalizedLead[] = [
      ...contacts.map(row => ({
        source: "contact",
        status: row.status,
        createdAt: row.createdAt,
        serviceKey: row.serviceSlug ?? "contact",
        serviceLabel: row.serviceSlug ? (SERVICE_LABELS[row.serviceSlug] ?? row.serviceSlug) : "Общая форма",
        pageUrl: row.pageUrl ?? undefined,
        utmSource: row.utmSource ?? undefined,
        utmMedium: row.utmMedium ?? undefined,
        utmCampaign: row.utmCampaign ?? undefined,
      })),
      ...rents.map(row => ({
        source: "rent",
        status: row.status,
        createdAt: row.createdAt,
        serviceKey: "rent",
        serviceLabel: row.car?.name ? `Аренда · ${row.car.name}` : "Аренда",
      })),
      ...sales.map(row => ({
        source: "sale",
        status: row.status,
        createdAt: row.createdAt,
        serviceKey: "sale",
        serviceLabel: row.car?.title ? `Продажа · ${row.car.title}` : "Продажа авто",
      })),
      ...autos.map(row => ({
        source: "autopodbor",
        status: row.status,
        createdAt: row.createdAt,
        serviceKey: row.serviceSlug ?? "autopodbor",
        serviceLabel: row.serviceTitle ?? "Автоподбор",
        pageUrl: row.pageUrl ?? undefined,
        utmSource: row.utmSource ?? undefined,
        utmMedium: row.utmMedium ?? undefined,
        utmCampaign: row.utmCampaign ?? undefined,
      })),
    ];

    const countMap = (keyFn: (lead: NormalizedLead) => string, labelFn: (lead: NormalizedLead) => string): AnalyticsCount[] => {
      const map = new Map<string, AnalyticsCount>();
      for (const lead of leads) {
        const key = keyFn(lead);
        const existing = map.get(key);
        if (existing) {
          existing.count++;
          if (lead.status === "new") existing.newCount++;
        } else {
          map.set(key, { key, label: labelFn(lead), count: 1, newCount: lead.status === "new" ? 1 : 0 });
        }
      }
      return [...map.values()].sort((a, b) => b.count - a.count);
    };

    const byDay: AnalyticsDay[] = [];
    const dayMap = new Map<string, number>();
    for (const lead of leads) {
      const key = dateKey(lead.createdAt);
      dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
    }
    for (let index = safeDays - 1; index >= 0; index--) {
      const day = new Date();
      day.setDate(day.getDate() - index);
      const key = dateKey(day);
      byDay.push({
        date: key,
        label: day.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }),
        count: dayMap.get(key) ?? 0,
      });
    }

    const utmMap = new Map<string, AnalyticsUtm>();
    for (const lead of leads) {
      if (!lead.utmSource && !lead.utmMedium && !lead.utmCampaign) continue;
      const key = `${lead.utmSource ?? ""}|${lead.utmMedium ?? ""}|${lead.utmCampaign ?? ""}`;
      const existing = utmMap.get(key);
      if (existing) existing.count++;
      else utmMap.set(key, {
        source: lead.utmSource ?? "",
        medium: lead.utmMedium ?? "",
        campaign: lead.utmCampaign ?? "",
        count: 1,
      });
    }

    const pageMap = new Map<string, number>();
    for (const lead of leads) {
      if (!lead.pageUrl) continue;
      let page = lead.pageUrl;
      try {
        const url = new URL(lead.pageUrl);
        page = url.pathname;
      } catch { /* оставляем как есть */ }
      pageMap.set(page, (pageMap.get(page) ?? 0) + 1);
    }

    return {
      days: safeDays,
      since: since.toISOString(),
      total: leads.length,
      newCount: leads.filter(lead => lead.status === "new").length,
      inWorkCount: leads.filter(lead => ["in_progress", "contacted", "options_sent", "meeting"].includes(lead.status)).length,
      doneCount: leads.filter(lead => ["done", "completed"].includes(lead.status)).length,
      bySource: countMap(lead => lead.source, lead => SOURCE_LABELS[lead.source] ?? lead.source),
      byService: countMap(lead => lead.serviceKey, lead => lead.serviceLabel).slice(0, 12),
      byDay,
      byUtm: [...utmMap.values()].sort((a, b) => b.count - a.count).slice(0, 12),
      topPages: [...pageMap.entries()].map(([page, count]) => ({ page, count })).sort((a, b) => b.count - a.count).slice(0, 10),
    };
  }
}
