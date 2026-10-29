import type { Vacancy } from "@/entities/vacancy/vacancy";

const EMPLOYMENT_LABELS: Record<string, string> = {
  full_time: "Полная занятость",
  part_time: "Частичная занятость",
  contract: "Контракт",
  temporary: "Временная работа",
  internship: "Стажировка",
};

const WORK_FORMAT_LABELS: Record<string, string> = {
  office: "В офисе",
  hybrid: "Гибрид",
  remote: "Удалённо",
};

const SALARY_PERIOD_LABELS: Record<string, string> = {
  month: "в месяц",
  hour: "в час",
  shift: "за смену",
  project: "за проект",
};

const numberFormatter = new Intl.NumberFormat("ru-RU");
const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function employmentLabel(value?: string): string {
  return (value && EMPLOYMENT_LABELS[value]) || "Занятость не указана";
}

export function workFormatLabel(value?: string): string {
  return (value && WORK_FORMAT_LABELS[value]) || "";
}

export function salaryPeriodLabel(value?: string): string {
  return (value && SALARY_PERIOD_LABELS[value]) || "";
}

function formatRange(from: number | undefined, to: number | undefined, currency: string, period: string): string {
  if (from && to) {
    return `${numberFormatter.format(from)}–${numberFormatter.format(to)} ${currency}${period ? ` ${period}` : ""}`;
  }
  if (from) {
    return `от ${numberFormatter.format(from)} ${currency}${period ? ` ${period}` : ""}`;
  }
  return `до ${numberFormatter.format(to ?? 0)} ${currency}${period ? ` ${period}` : ""}`;
}

export function formatSalary(vacancy: Pick<Vacancy, "salaryFrom" | "salaryTo" | "salaryCurrency" | "salaryPeriod" | "salaryType">): string {
  const from = vacancy.salaryFrom;
  const to = vacancy.salaryTo;
  const currency = vacancy.salaryCurrency || "BYN";
  const period = salaryPeriodLabel(vacancy.salaryPeriod);
  const type = vacancy.salaryType ?? "fixed";

  if (type === "negotiable") return "Оплата по договорённости";

  if (type === "piecework") {
    return from || to ? `Сдельная — ${formatRange(from, to, currency, period)}` : "Сдельная оплата";
  }

  if (!from && !to) return "Оплата по результатам собеседования";

  return formatRange(from, to, currency, period);
}

export function parseLines(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatPublished(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateFormatter.format(date);
}
