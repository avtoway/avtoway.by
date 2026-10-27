import type { AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";

export function parseList(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function formatPrice(value?: number, options?: { from?: boolean; currency?: string }): string | null {
  if (value == null) return null;
  const currency = options?.currency ?? "BYN";
  return `${options?.from ? "от " : ""}${value.toLocaleString("ru-RU")} ${currency}`;
}

export function tariffPrice(tariff: AutoPodborTariff): string | null {
  return formatPrice(tariff.price, { from: tariff.priceFrom, currency: tariff.currency });
}

export const TARIFF_GROUP_LABEL: Record<string, string> = {
  rb: "По Беларуси",
  abroad: "Из-за границы",
  extra: "Дополнительно",
};

export const CHECK_CATEGORY_LABEL: Record<string, string> = {
  body: "Кузов и ЛКП",
  engine: "Двигатель и КПП",
  chassis: "Ходовая и тормоза",
  electronics: "Электроника",
  interior: "Салон и пробег",
  legal: "Документы и юр. чистота",
};

export const CHECK_CATEGORY_ORDER = ["body", "engine", "chassis", "electronics", "interior", "legal"];

export const LEAD_STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  contacted: "Связались",
  in_progress: "В работе",
  options_sent: "Варианты отправлены",
  meeting: "Встреча",
  done: "Завершена",
  cancelled: "Отменена",
  spam: "Спам",
};

export const REVIEW_SOURCE_LABEL: Record<string, string> = {
  site: "Сайт",
  yandex: "Яндекс.Карты",
  google: "Google",
  telegram: "Telegram",
};

export function initials(name?: string): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0]?.toUpperCase() ?? "").join("");
}

export function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} дня`;
  return `${n} дней`;
}
