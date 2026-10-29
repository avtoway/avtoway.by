"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

type LeadSource = "contact" | "rent" | "sale" | "autopodbor";

interface UnifiedLead {
  key: string;
  id: string;
  source: LeadSource;
  sourceLabel: string;
  serviceLabel?: string;
  name: string;
  phone?: string;
  email?: string;
  summary: string;
  status: string;
  createdAt: string;
  href?: string;
  pageUrl?: string;
  utm?: string;
}

interface ContactRequest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  source?: string;
  serviceSlug?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: string;
  createdAt: string;
}

interface RentRequest {
  id: string;
  car?: { name: string; slug: string };
  name: string;
  phone?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  total?: number;
  status: string;
  message?: string;
  createdAt: string;
}

interface SaleRequest {
  id: string;
  type: string;
  car?: { title: string };
  clientName: string;
  clientPhone: string;
  carInfo?: string;
  offerPrice?: number;
  comment?: string;
  status: string;
  createdAt: string;
}

interface AutoPodborLead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  serviceTitle?: string;
  brand?: string;
  model?: string;
  city?: string;
  comment?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: string;
  createdAt: string;
}

const SOURCE_LABELS: Record<LeadSource, string> = {
  contact: "Общая форма",
  rent: "Аренда",
  sale: "Продажа",
  autopodbor: "Автоподбор",
};

const SOURCE_STYLE: Record<LeadSource, string> = {
  contact: "border-red-500/20 bg-red-500/10 text-red-300",
  rent: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  sale: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  autopodbor: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
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

const CONTACT_SOURCE_LABELS: Record<string, string> = {
  service_landing: "Лендинг услуги",
  contacts: "Контакты",
  vacancy: "Вакансия",
  site: "Сайт",
};

const STATUS_OPTIONS: Record<LeadSource, Array<{ value: string; label: string }>> = {
  contact: [
    { value: "new", label: "Новая" },
    { value: "in_progress", label: "В работе" },
    { value: "done", label: "Завершена" },
    { value: "archived", label: "Архив" },
  ],
  rent: [
    { value: "new", label: "Новая" },
    { value: "in_progress", label: "В работе" },
    { value: "done", label: "Завершена" },
    { value: "cancelled", label: "Отменена" },
  ],
  sale: [
    { value: "new", label: "Новая" },
    { value: "in_progress", label: "В работе" },
    { value: "completed", label: "Завершена" },
    { value: "rejected", label: "Отклонена" },
  ],
  autopodbor: [
    { value: "new", label: "Новая" },
    { value: "contacted", label: "Позвонили" },
    { value: "in_progress", label: "В работе" },
    { value: "options_sent", label: "Варианты отправлены" },
    { value: "meeting", label: "Встреча" },
    { value: "done", label: "Завершена" },
    { value: "cancelled", label: "Отменена" },
    { value: "spam", label: "Спам" },
  ],
};

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(STATUS_OPTIONS).flat().map((item) => [item.value, item.label]),
);

const STATUS_STYLE: Record<string, string> = {
  new: "border-blue-500/30 bg-blue-500/15 text-blue-400",
  contacted: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  in_progress: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  options_sent: "border-violet-500/30 bg-violet-500/15 text-violet-400",
  meeting: "border-pink-500/30 bg-pink-500/15 text-pink-400",
  done: "border-green-500/30 bg-green-500/15 text-green-400",
  completed: "border-green-500/30 bg-green-500/15 text-green-400",
  archived: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  cancelled: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  rejected: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
  spam: "border-zinc-700 bg-zinc-800 text-zinc-500",
};

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU");
}

export default function AdminRequestsPage() {
  const [items, setItems] = useState<UnifiedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<LeadSource | "all">("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);

    const results = await Promise.allSettled([
      fetch("/api/contact-requests", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/rent/requests", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/sell/requests", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/autopodbor/leads?limit=100", { cache: "no-store" }).then((response) => response.json()),
    ]);

    const next: UnifiedLead[] = [];

    const contactResult = results[0];
    if (contactResult.status === "fulfilled" && contactResult.value.ok) {
      for (const item of contactResult.value.data as ContactRequest[]) {
        next.push({
          key: `contact-${item.id}`,
          id: item.id,
          source: "contact",
          sourceLabel: CONTACT_SOURCE_LABELS[item.source ?? "site"] ?? SOURCE_LABELS.contact,
          serviceLabel: item.serviceSlug ? (SERVICE_LABELS[item.serviceSlug] ?? item.serviceSlug) : undefined,
          name: item.name,
          phone: item.phone,
          email: item.email,
          summary: item.message,
          status: item.status,
          createdAt: item.createdAt,
          pageUrl: item.pageUrl,
          utm: [item.utmSource, item.utmMedium, item.utmCampaign].filter(Boolean).join(" / ") || undefined,
        });
      }
    }

    const rentResult = results[1];
    if (rentResult.status === "fulfilled" && rentResult.value.ok) {
      for (const item of rentResult.value.data as RentRequest[]) {
        next.push({
          key: `rent-${item.id}`,
          id: item.id,
          source: "rent",
          sourceLabel: SOURCE_LABELS.rent,
          serviceLabel: item.car?.name,
          name: item.name,
          phone: item.phone,
          email: item.email,
          summary: item.message ?? [
            item.car?.name,
            item.days ? `${item.days} дн.` : null,
            item.total ? `${item.total} BYN` : null,
          ].filter(Boolean).join(" · "),
          status: item.status,
          createdAt: item.createdAt,
          href: "/admin/rent",
        });
      }
    }

    const saleResult = results[2];
    if (saleResult.status === "fulfilled" && saleResult.value.ok) {
      for (const item of saleResult.value.data as SaleRequest[]) {
        next.push({
          key: `sale-${item.id}`,
          id: item.id,
          source: "sale",
          sourceLabel: SOURCE_LABELS.sale,
          serviceLabel: item.car?.title ?? item.carInfo,
          name: item.clientName,
          phone: item.clientPhone,
          summary: [item.type, item.car?.title ?? item.carInfo, item.comment].filter(Boolean).join(" · "),
          status: item.status,
          createdAt: item.createdAt,
          href: "/admin/sell",
        });
      }
    }

    const autoResult = results[3];
    if (autoResult.status === "fulfilled" && autoResult.value.ok) {
      const autoData = autoResult.value.data as { items?: AutoPodborLead[] };
      for (const item of autoData.items ?? []) {
        next.push({
          key: `autopodbor-${item.id}`,
          id: item.id,
          source: "autopodbor",
          sourceLabel: SOURCE_LABELS.autopodbor,
          serviceLabel: item.serviceTitle,
          name: item.name,
          phone: item.phone,
          email: item.email,
          summary: [item.brand, item.model, item.city, item.comment].filter(Boolean).join(" · "),
          status: item.status,
          createdAt: item.createdAt,
          href: "/admin/inspection",
          pageUrl: item.pageUrl,
          utm: [item.utmSource, item.utmMedium, item.utmCampaign].filter(Boolean).join(" / ") || undefined,
        });
      }
    }

    next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setItems(next);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function updateStatus(lead: UnifiedLead, status: string) {
    const endpoints: Record<LeadSource, { url: string; method: string; body: object }> = {
      contact: { url: "/api/contact-requests", method: "PATCH", body: { id: lead.id, status } },
      rent: { url: `/api/rent/requests/${lead.id}`, method: "PUT", body: { status } },
      sale: { url: `/api/sell/requests/${lead.id}`, method: "PATCH", body: { status } },
      autopodbor: { url: `/api/autopodbor/leads/${lead.id}`, method: "PATCH", body: { status } },
    };

    const request = endpoints[lead.source];
    const response = await fetch(request.url, {
      method: request.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request.body),
    });
    const json = await response.json();
    if (json.ok) {
      setItems((prev) => prev.map((item) => item.key === lead.key ? { ...item, status } : item));
      toast("Статус обновлён");
    } else {
      toast(json.error ?? "Не удалось обновить статус", "error");
    }
  }

  async function removeContact(lead: UnifiedLead) {
    const ok = await confirm({
      title: "Удаление заявки",
      message: `Удалить заявку от ${lead.name}?`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;

    const response = await fetch(`/api/contact-requests?id=${lead.id}`, { method: "DELETE" });
    const json = await response.json();
    if (json.ok) {
      setItems((prev) => prev.filter((item) => item.key !== lead.key));
      toast("Заявка удалена");
    } else {
      toast(json.error ?? "Ошибка удаления", "error");
    }
  }

  const filtered = useMemo(() => items.filter((lead) => {
    if (sourceFilter !== "all" && lead.source !== sourceFilter) return false;
    if (statusFilter && lead.status !== statusFilter) return false;
    if (search) {
      const haystack = [lead.name, lead.phone, lead.email, lead.summary, lead.serviceLabel, lead.sourceLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  }), [items, sourceFilter, statusFilter, search]);

  const newCount = items.filter((lead) => lead.status === "new").length;
  const inWorkCount = items.filter((lead) => ["in_progress", "contacted", "options_sent", "meeting"].includes(lead.status)).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Все заявки</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Единый центр обращений с сайта. Заявки с лендингов, аренды, продажи и автоподбора.
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Всего</p>
          <p className="mt-1 text-2xl font-bold text-white">{items.length}</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-blue-400">Новые</p>
          <p className="mt-1 text-2xl font-bold text-white">{newCount}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-[10px] uppercase tracking-wider text-amber-400">В работе</p>
          <p className="mt-1 text-2xl font-bold text-white">{inWorkCount}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Поиск по имени, телефону, тексту..."
          className="w-full max-w-sm rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        />
        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value as LeadSource | "all")}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        >
          <option value="all">Все источники</option>
          <option value="contact">Общие формы</option>
          <option value="rent">Аренда</option>
          <option value="sale">Продажа</option>
          <option value="autopodbor">Автоподбор</option>
        </select>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-slate-500 hover:text-white"
        >
          Обновить
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
          <p className="text-sm text-slate-500">
            {items.length === 0 ? "Заявок пока нет." : "По фильтру ничего не найдено."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((lead) => (
            <article key={lead.key} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${SOURCE_STYLE[lead.source]}`}>
                    {lead.sourceLabel}
                  </span>
                  {lead.serviceLabel && (
                    <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-[10px] text-slate-400">
                      {lead.serviceLabel}
                    </span>
                  )}
                  <span className="text-xs text-slate-600">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(event) => void updateStatus(lead, event.target.value)}
                    className={`rounded-lg border bg-slate-900 px-2 py-1.5 text-xs outline-none ${STATUS_STYLE[lead.status] ?? "border-slate-700 text-slate-300"}`}
                  >
                    {STATUS_OPTIONS[lead.source].map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {lead.source === "contact" && (
                    <button
                      type="button"
                      onClick={() => void removeContact(lead)}
                      className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-red-500 hover:text-red-400"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <p className="font-semibold text-white">{lead.name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                  {lead.phone && <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{lead.phone}</a>}
                  {lead.email && <a href={`mailto:${lead.email}`} className="break-all hover:text-white">{lead.email}</a>}
                  <span className="text-slate-600">Статус: {statusLabel(lead.status)}</span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{lead.summary}</p>
                {(lead.pageUrl || lead.utm) && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-600">
                    {lead.pageUrl && (
                      <a href={lead.pageUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:text-slate-400">
                        Страница: {lead.pageUrl}
                      </a>
                    )}
                    {lead.utm && <span>UTM: {lead.utm}</span>}
                  </div>
                )}
              </div>

              {lead.href && (
                <div className="mt-4 flex justify-end border-t border-slate-800/70 pt-3">
                  <Link href={lead.href} className="text-xs font-medium text-red-300 transition hover:text-red-200">
                    Открыть в модуле →
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}
