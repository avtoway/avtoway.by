import "@/di/composition-root";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { LeadStatus } from "@/entities/autopodbor/autopodbor.types";

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  contacted: "Связались",
  in_progress: "В работе",
  options_sent: "Варианты отправлены",
  meeting: "Встреча",
  done: "Завершена",
  cancelled: "Отменена",
  spam: "Спам",
};

const HEADERS = [
  "Дата", "Имя", "Телефон", "Email", "Мессенджер", "Город",
  "Бюджет от", "Бюджет до", "Марка", "Модель", "Услуга", "Статус",
  "Источник", "Комментарий", "Страница", "UTM source", "UTM medium", "UTM campaign",
];

function cell(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    await requireAnyAuth(["autopodbor.requests", "autopodbor.view", "autopodbor.manage"]);
    const repo = container.get<AutoPodborRepository>("AutoPodborRepository");
    const all: Awaited<ReturnType<AutoPodborRepository["getLeads"]>>["items"] = [];
    for (let page = 1; page <= 50; page++) {
      const chunk = await repo.getLeads({ limit: 100, page });
      all.push(...chunk.items);
      if (all.length >= chunk.total || chunk.items.length === 0) break;
    }

    const rows = all.map(lead => [
      new Date(lead.createdAt).toLocaleString("ru-RU"),
      lead.name,
      lead.phone,
      lead.email,
      lead.messenger,
      lead.city,
      lead.budgetFrom,
      lead.budgetTo,
      lead.brand,
      lead.model,
      lead.serviceTitle,
      STATUS_LABEL[lead.status as LeadStatus] ?? lead.status,
      lead.source,
      lead.comment,
      lead.pageUrl,
      lead.utmSource,
      lead.utmMedium,
      lead.utmCampaign,
    ].map(cell).join(";"));

    const csv = "\uFEFF" + [HEADERS.map(cell).join(";"), ...rows].join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="autopodbor-leads.csv"',
      },
    });
  } catch (e) { return toApiError(e); }
}
