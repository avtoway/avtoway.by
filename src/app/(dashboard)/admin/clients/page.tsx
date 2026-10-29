"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeadCrmPanel from "@/features/admin/crm/ui/lead-crm-panel";
import type { CrmClient, CrmClientSummary, LeadSource } from "@/entities/crm/crm.types";

const SOURCE_LABEL: Record<LeadSource, string> = {
  contact: "Общая форма",
  rent: "Аренда",
  sale: "Продажа",
  autopodbor: "Автоподбор",
};

const SOURCE_STYLE: Record<LeadSource, string> = {
  contact: "bg-red-500/10 text-red-300",
  rent: "bg-blue-500/10 text-blue-300",
  sale: "bg-amber-500/10 text-amber-300",
  autopodbor: "bg-emerald-500/10 text-emerald-300",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Новая",
  contacted: "Позвонили",
  in_progress: "В работе",
  options_sent: "Варианты отправлены",
  meeting: "Встреча",
  done: "Завершена",
  completed: "Завершена",
  archived: "Архив",
  cancelled: "Отменена",
  rejected: "Отклонена",
  spam: "Спам",
};

export default function AdminClientsPage() {
  const [items, setItems] = useState<CrmClientSummary[]>([]);
  const [client, setClient] = useState<CrmClient | null>(null);
  const [search, setSearch] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [crmLead, setCrmLead] = useState<{ source: LeadSource; id: string; name: string; phone?: string } | null>(null);

  async function loadList(query = search) {
    const response = await fetch(`/api/crm/clients?search=${encodeURIComponent(query)}`, { cache: "no-store" });
    const json = await response.json();
    if (json.ok) setItems(json.data);
    setLoading(false);
  }

  async function loadClient(value: string) {
    setPhone(value);
    if (!value) { setClient(null); return; }
    const response = await fetch(`/api/crm/clients?phone=${encodeURIComponent(value)}`, { cache: "no-store" });
    const json = await response.json();
    setClient(json.ok ? json.data : null);
  }

  useEffect(() => {
    queueMicrotask(() => {
      const initial = new URLSearchParams(window.location.search).get("phone") ?? "";
      void loadList("");
      if (initial) void loadClient(initial);
    });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Клиенты</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          История обращений по телефону: заявки, аренда, продажа и автоподбор в одной карточке.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[330px_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/30">
          <div className="border-b border-slate-800 p-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void loadList(); }}
              placeholder="Имя, телефон или email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
            />
          </div>
          <div className="max-h-[65vh] overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-slate-500">Загрузка...</p>
            ) : items.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Клиенты не найдены.</p>
            ) : items.map((item) => (
              <button
                key={item.phone}
                type="button"
                onClick={() => void loadClient(item.phone)}
                className={`w-full border-b border-slate-800/60 p-3 text-left transition hover:bg-slate-900 ${
                  phone === item.phone ? "bg-red-600/10" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{item.name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.phone.startsWith("375") ? `+${item.phone}` : item.phone}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">{item.total}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.sources.map(source => (
                    <span key={source} className={`rounded px-1.5 py-0.5 text-[9px] ${SOURCE_STYLE[source]}`}>
                      {SOURCE_LABEL[source]}
                    </span>
                  ))}
                  {item.newCount > 0 && <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] text-red-300">новых: {item.newCount}</span>}
                </div>
                <p className="mt-2 text-[10px] text-slate-600">{new Date(item.lastAt).toLocaleString("ru-RU")}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!client ? (
            <div className="rounded-xl border border-dashed border-slate-800 p-16 text-center text-sm text-slate-500">
              Выберите клиента слева или откройте карточку из заявки.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white">{client.name}</h2>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">
                      <a href={`tel:${client.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{client.phone}</a>
                      {client.email && <a href={`mailto:${client.email}`} className="hover:text-white">{client.email}</a>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`https://wa.me/${client.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">WhatsApp</a>
                    <a href={`viber://chat?number=${client.phone.replace(/\D/g, "")}`} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:text-white">Viber</a>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300">Всего обращений: {client.leads.length}</span>
                  <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-blue-300">
                    Новых: {client.leads.filter(lead => lead.status === "new").length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {client.leads.map(lead => (
                  <article key={`${lead.source}-${lead.id}`} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded px-2 py-1 text-[10px] ${SOURCE_STYLE[lead.source]}`}>{SOURCE_LABEL[lead.source]}</span>
                        {lead.serviceLabel && <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-400">{lead.serviceLabel}</span>}
                        <span className="text-[10px] text-slate-600">{new Date(lead.createdAt).toLocaleString("ru-RU")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{STATUS_LABEL[lead.status] ?? lead.status}</span>
                        <button
                          type="button"
                          onClick={() => setCrmLead({ source: lead.source, id: lead.id, name: lead.name, phone: lead.phone })}
                          className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-300 hover:text-white"
                        >
                          CRM
                        </button>
                        {lead.href && <Link href={lead.href} className="text-[10px] text-red-300 hover:text-red-200">Модуль ↗</Link>}
                      </div>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{lead.summary}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {crmLead && (
        <LeadCrmPanel
          source={crmLead.source}
          leadId={crmLead.id}
          leadName={crmLead.name}
          phone={crmLead.phone}
          onClose={() => setCrmLead(null)}
        />
      )}
    </div>
  );
}
