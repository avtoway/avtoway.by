"use client";

import { useEffect, useState } from "react";
import type { AutoPodborStats } from "@/entities/autopodbor/autopodbor.types";
import { LEAD_STATUS_LABEL, formatPrice } from "@/features/autopodbor/lib/parse";
import { useToast } from "@/shared/lib/toast-context";

type AdminTab = "overview" | "content" | "tariffs" | "process" | "proof" | "leads" | "settings";

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-600">{hint}</p>}
    </div>
  );
}

export default function OverviewTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [stats, setStats] = useState<AutoPodborStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/autopodbor/stats")
      .then(response => response.json())
      .then(json => {
        if (cancelled) return;
        if (json.ok) setStats(json.data as AutoPodborStats);
        else toast(json.error ?? "Не удалось загрузить статистику", "error");
      })
      .catch(() => { if (!cancelled) toast("Нет связи с сервером", "error"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast]);

  if (loading) return <p className="text-sm text-slate-500">Загрузка статистики…</p>;
  if (!stats) return <p className="text-sm text-slate-500">Статистика недоступна.</p>;

  const maxDay = Math.max(1, ...stats.byDay.map(day => day.count));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card label="Новые заявки" value={stats.newCount} />
        <Card label="В работе" value={stats.inWork} />
        <Card label="Завершено" value={stats.done} />
        <Card label="Конверсия в сделку" value={`${stats.conversion}%`} hint="от всех заявок" />
        <Card label="Средний бюджет" value={stats.avgBudget ? `$${stats.avgBudget.toLocaleString("ru-RU")}` : "—"} />
        <Card label="Топ-тариф" value={stats.topTariff?.title ?? "—"} hint={stats.topTariff ? `${stats.topTariff.count} заявок` : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Заявки за 14 дней</h3>
            <span className="text-xs text-slate-500">всего {stats.total}</span>
          </div>
          <div className="flex h-32 items-end gap-1">
            {stats.byDay.map(day => (
              <div key={day.date} className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-sm bg-red-500/70 transition group-hover:bg-red-500"
                  style={{ height: `${Math.max(3, (day.count / maxDay) * 100)}%` }}
                  title={`${day.date}: ${day.count}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-600">
            <span>{stats.byDay[0]?.date.slice(5)}</span>
            <span>{stats.byDay[stats.byDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">Быстрые действия</h3>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onNavigate("tariffs")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700">
              Добавить тариф
            </button>
            <button type="button" onClick={() => onNavigate("leads")} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white">
              Открыть заявки
            </button>
            <a href="/services/inspection" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500 hover:text-white">
              Открыть лендинг ↗
            </a>
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-slate-500">
            <p>Новые: <span className="text-white">{stats.newCount}</span></p>
            <p>Отменено/спам: <span className="text-white">{stats.cancelled}</span></p>
            <p>Всего: <span className="text-white">{stats.total}</span></p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Последние заявки</h3>
          <button type="button" onClick={() => onNavigate("leads")} className="text-xs text-slate-400 hover:text-white">Все →</button>
        </div>
        {stats.latest.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">Пока нет заявок.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Дата</th>
                  <th className="px-4 py-2">Имя</th>
                  <th className="px-4 py-2">Телефон</th>
                  <th className="px-4 py-2">Услуга</th>
                  <th className="px-4 py-2">Бюджет</th>
                  <th className="px-4 py-2">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.latest.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-900/30">
                    <td className="px-4 py-2 text-xs text-slate-500">{new Date(lead.createdAt).toLocaleString("ru-RU")}</td>
                    <td className="px-4 py-2 text-white">{lead.name}</td>
                    <td className="px-4 py-2 text-slate-400">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-400">{lead.serviceTitle ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-400">{formatPrice(lead.budgetFrom ?? lead.budgetTo, { from: lead.budgetFrom != null, currency: "$" }) ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-300">{LEAD_STATUS_LABEL[lead.status] ?? lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
