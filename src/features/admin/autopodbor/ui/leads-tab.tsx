"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { AutoPodborCity, AutoPodborLead, AutoPodborStats, AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import { LEAD_STATUS_LABEL, formatPrice } from "@/features/autopodbor/lib/parse";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { LEAD_STATUS_OPTIONS } from "../lib/options";
import { getJson } from "../lib/api";

interface Assignee { id: string; name: string; login: string }

const STATUS_STYLE: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400",
  contacted: "bg-amber-500/10 text-amber-400",
  in_progress: "bg-violet-500/10 text-violet-400",
  options_sent: "bg-cyan-500/10 text-cyan-400",
  meeting: "bg-indigo-500/10 text-indigo-400",
  done: "bg-green-500/10 text-green-400",
  cancelled: "bg-zinc-500/10 text-zinc-400",
  spam: "bg-red-500/10 text-red-400",
};

function digits(value?: string): string {
  return value?.replace(/\D/g, "") ?? "";
}

export default function LeadsTab() {
  const [items, setItems] = useState<AutoPodborLead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AutoPodborStats | null>(null);
  const [services, setServices] = useState<AutoPodborTariff[]>([]);
  const [cities, setCities] = useState<AutoPodborCity[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selected, setSelected] = useState<AutoPodborLead | null>(null);

  const [draft, setDraft] = useState({ status: "", service: "", city: "", search: "", from: "", to: "" });
  const [applied, setApplied] = useState(draft);

  const [note, setNote] = useState("");
  const [priceQuoted, setPriceQuoted] = useState("");
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();
  const { confirm } = useConfirm();

  const limit = 25;

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (applied.status) params.set("status", applied.status);
    if (applied.service) params.set("service", applied.service);
    if (applied.city) params.set("city", applied.city);
    if (applied.search) params.set("search", applied.search);
    if (applied.from) params.set("from", applied.from);
    if (applied.to) params.set("to", applied.to);

    const json = await getJson<{ items: AutoPodborLead[]; total: number }>(`/api/autopodbor/leads?${params.toString()}`);
    if (json?.ok && json.data) {
      setItems(json.data.items);
      setTotal(json.data.total);
    } else {
      toast(json?.error ?? "Не удалось загрузить заявки", "error");
    }
    setLoading(false);
  }, [applied, page, toast]);

  // queueMicrotask: не вызываем setState синхронно в теле эффекта
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/autopodbor/stats").then(response => response.json()),
      fetch("/api/autopodbor/tariffs").then(response => response.json()),
      fetch("/api/autopodbor/cities").then(response => response.json()),
      fetch("/api/autopodbor/assignees").then(response => response.json()),
    ]).then(([statsJson, servicesJson, citiesJson, assigneesJson]) => {
      if (statsJson.ok) setStats(statsJson.data as AutoPodborStats);
      if (servicesJson.ok) setServices(servicesJson.data as AutoPodborTariff[]);
      if (citiesJson.ok) setCities(citiesJson.data as AutoPodborCity[]);
      if (assigneesJson.ok) setAssignees(assigneesJson.data as Assignee[]);
    }).catch(() => { /* не критично */ });
  }, []);

  function openLead(lead: AutoPodborLead) {
    setSelected(lead);
    setNote(lead.internalNote ?? "");
    setPriceQuoted(lead.priceQuoted == null ? "" : String(lead.priceQuoted));
  }

  async function patch(lead: AutoPodborLead, data: Record<string, unknown>) {
    setSaving(true);
    try {
      const response = await fetch(`/api/autopodbor/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        toast(json.error ?? "Не удалось сохранить", "error");
        return false;
      }
      const updated = json.data as AutoPodborLead;
      setItems(prev => prev.map(item => item.id === updated.id ? updated : item));
      setSelected(current => current?.id === updated.id ? updated : current);
      const statsJson = await getJson<AutoPodborStats>("/api/autopodbor/stats");
      if (statsJson?.ok && statsJson.data) setStats(statsJson.data);
      toast("Сохранено");
      return true;
    } catch {
      toast("Нет связи с сервером", "error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(lead: AutoPodborLead) {
    const ok = await confirm({ title: "Удалить заявку", message: `Удалить заявку от ${lead.name}?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    const response = await fetch(`/api/autopodbor/leads/${lead.id}`, { method: "DELETE" });
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.ok) {
      toast("Заявка удалена");
      setSelected(null);
      await load();
    } else {
      toast(json.error ?? "Не удалось удалить", "error");
    }
  }

  async function copyPhone(phone?: string) {
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      toast("Телефон скопирован");
    } catch {
      toast("Не удалось скопировать", "error");
    }
  }

  const pages = Math.max(1, Math.ceil(total / limit));
  const quiz = (() => {
    if (!selected?.quiz) return null;
    try { return JSON.parse(selected.quiz) as Record<string, unknown>; } catch { return null; }
  })();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-blue-400">Новые: {stats?.newCount ?? "—"}</span>
          <span className="rounded-lg bg-violet-500/10 px-3 py-1.5 text-violet-400">В работе: {stats?.inWork ?? "—"}</span>
          <span className="rounded-lg bg-green-500/10 px-3 py-1.5 text-green-400">Завершено: {stats?.done ?? "—"}</span>
          <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300">Всего: {stats?.total ?? "—"}</span>
        </div>
        <Link href="/api/autopodbor/leads/export" prefetch={false} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white">
          Экспорт CSV
        </Link>
      </div>

      <form
        onSubmit={event => { event.preventDefault(); setPage(1); setApplied(draft); }}
        className="mb-4 grid gap-2 rounded-xl border border-slate-800 bg-slate-900/30 p-4 sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          value={draft.search}
          onChange={event => setDraft({ ...draft, search: event.target.value })}
          placeholder="Поиск: имя, телефон, email"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        />
        <select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value="">Все статусы</option>
          {LEAD_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <select value={draft.service} onChange={event => setDraft({ ...draft, service: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value="">Все услуги</option>
          {services.map(service => <option key={service.slug} value={service.slug}>{service.title}</option>)}
        </select>
        <select value={draft.city} onChange={event => setDraft({ ...draft, city: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">
          <option value="">Все города</option>
          {cities.map(city => <option key={city.id} value={city.name}>{city.name}</option>)}
        </select>
        <input type="date" value={draft.from} onChange={event => setDraft({ ...draft, from: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        <input type="date" value={draft.to} onChange={event => setDraft({ ...draft, to: event.target.value })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Применить</button>
          <button type="button" onClick={() => { const empty = { status: "", service: "", city: "", search: "", from: "", to: "" }; setDraft(empty); setApplied(empty); setPage(1); }}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:text-white">Сбросить</button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Дата</th>
              <th className="px-3 py-2">Имя</th>
              <th className="px-3 py-2">Телефон</th>
              <th className="px-3 py-2">Город</th>
              <th className="px-3 py-2">Услуга</th>
              <th className="px-3 py-2">Бюджет</th>
              <th className="px-3 py-2">Источник</th>
              <th className="px-3 py-2">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">Загрузка…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={8} className="px-3 py-6 text-center text-slate-500">Заявок нет.</td></tr>
            ) : items.map(lead => (
              <tr key={lead.id} onClick={() => openLead(lead)} className="cursor-pointer hover:bg-slate-900/40">
                <td className="px-3 py-2 text-xs text-slate-500">{new Date(lead.createdAt).toLocaleString("ru-RU")}</td>
                <td className="px-3 py-2 font-medium text-white">{lead.name}</td>
                <td className="px-3 py-2 text-slate-400">{lead.phone ?? "—"}</td>
                <td className="px-3 py-2 text-slate-400">{lead.city ?? "—"}</td>
                <td className="px-3 py-2 text-slate-400">{lead.serviceTitle ?? "—"}</td>
                <td className="px-3 py-2 text-slate-400">{formatPrice(lead.budgetFrom, { from: true, currency: "$" }) ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{lead.source}</td>
                <td className="px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-[11px] ${STATUS_STYLE[lead.status] ?? "bg-slate-800 text-slate-300"}`}>
                    {LEAD_STATUS_LABEL[lead.status] ?? lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{total} заявок</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage(value => value - 1)}
              className="rounded border border-slate-700 px-2 py-1 disabled:opacity-40">←</button>
            <span>{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(value => value + 1)}
              className="rounded border border-slate-700 px-2 py-1 disabled:opacity-40">→</button>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60" onClick={() => setSelected(null)}>
          <aside className="h-full w-full max-w-lg overflow-y-auto border-l border-slate-800 bg-slate-950 p-5" onClick={event => event.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
                <p className="text-xs text-slate-500">{new Date(selected.createdAt).toLocaleString("ru-RU")} · {selected.source}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Телефон</p><p className="text-white">{selected.phone ?? "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Email</p><p className="truncate text-white">{selected.email ?? "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Город</p><p className="text-white">{selected.city ?? "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Мессенджер</p><p className="text-white">{selected.messenger ?? "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Бюджет</p><p className="text-white">{formatPrice(selected.budgetFrom, { from: true, currency: "$" }) ?? "—"} {selected.budgetTo ? `— ${formatPrice(selected.budgetTo, { currency: "$" })}` : ""}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Услуга</p><p className="text-white">{selected.serviceTitle ?? "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Авто</p><p className="text-white">{[selected.brand, selected.model].filter(Boolean).join(" ") || "—"}</p></div>
              <div className="rounded-lg bg-slate-900/60 p-3"><p className="text-[11px] text-slate-500">Ответственный</p><p className="text-white">{selected.assignedTo?.name ?? "—"}</p></div>
            </div>

            {selected.comment && (
              <div className="mt-3 rounded-lg border border-slate-800 p-3 text-sm text-slate-300">
                <p className="mb-1 text-[11px] text-slate-500">Комментарий</p>
                {selected.comment}
              </div>
            )}

            {quiz && (
              <div className="mt-3 rounded-lg border border-slate-800 p-3 text-xs text-slate-400">
                <p className="mb-1 text-[11px] text-slate-500">Ответы квиза</p>
                <ul className="space-y-1">
                  {Object.entries(quiz).map(([key, value]) => (
                    <li key={key}><span className="text-slate-500">{key}:</span> {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {selected.phone && (
                <a href={`tel:${digits(selected.phone)}`} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700">Позвонить</a>
              )}
              {selected.phone && (
                <a href={`https://wa.me/${digits(selected.phone)}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">WhatsApp</a>
              )}
              {selected.phone && (
                <a href={`viber://chat?number=${digits(selected.phone)}`} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">Viber</a>
              )}
              {selected.phone && (
                <button type="button" onClick={() => void copyPhone(selected.phone)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">Скопировать телефон</button>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-800 pt-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Статус</span>
                <select
                  value={selected.status}
                  onChange={event => { const lead = selected; if (lead) void patch(lead, { status: event.target.value }); }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {LEAD_STATUS_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Ответственный</span>
                <select
                  value={selected.assignedToId ?? ""}
                  onChange={event => { const lead = selected; if (lead) void patch(lead, { assignedToId: event.target.value || null }); }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  <option value="">Не назначен</option>
                  {assignees.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Цена, которую назвали (BYN)</span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={priceQuoted}
                    onChange={event => setPriceQuoted(event.target.value)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                  <button type="button" disabled={saving}
                    onClick={() => { const lead = selected; if (lead) void patch(lead, { priceQuoted: priceQuoted === "" ? null : Number(priceQuoted) }); }}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white disabled:opacity-50">Сохранить</button>
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Внутренняя заметка</span>
                <textarea
                  rows={3}
                  value={note}
                  onChange={event => setNote(event.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
                <button type="button" disabled={saving}
                  onClick={() => { const lead = selected; if (lead) void patch(lead, { internalNote: note }); }}
                  className="self-end rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white disabled:opacity-50">Сохранить заметку</button>
              </label>

              {(selected.pageUrl || selected.utmSource || selected.utmMedium || selected.utmCampaign) && (
                <div className="rounded-lg bg-slate-900/50 p-3 text-[11px] text-slate-500">
                  {selected.pageUrl && <p className="truncate">Страница: {selected.pageUrl}</p>}
                  {(selected.utmSource || selected.utmMedium || selected.utmCampaign) && (
                    <p>UTM: {[selected.utmSource, selected.utmMedium, selected.utmCampaign].filter(Boolean).join(" / ")}</p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button type="button" onClick={() => void remove(selected)}
                  className="rounded-lg border border-red-900/60 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40">
                  Удалить заявку
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
