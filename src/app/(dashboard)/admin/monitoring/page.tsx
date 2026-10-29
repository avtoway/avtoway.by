"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";

interface HealthCheck {
  status: "ok" | "error" | "not_configured";
  detail?: string;
  latencyMs?: number;
}

interface Health {
  ok: boolean;
  status: string;
  timestamp: string;
  latencyMs: number;
  checks: Record<string, HealthCheck>;
}

interface SystemEvent {
  id: string;
  level: string;
  source: string;
  message: string;
  details?: string;
  createdAt: string;
}

interface BackupInfo {
  name: string;
  size: number;
  createdAt: string;
  integrity?: string;
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

export default function AdminMonitoringPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  async function load() {
    const [healthJson, eventsJson, backupsJson] = await Promise.all([
      fetch("/api/health", { cache: "no-store" }).then(response => response.json()),
      fetch("/api/monitoring/events?limit=100", { cache: "no-store" }).then(response => response.json()),
      fetch("/api/monitoring/backup", { cache: "no-store" }).then(response => response.json()),
    ]);
    setHealth(healthJson);
    if (eventsJson.ok) setEvents(eventsJson.data);
    if (backupsJson.ok) setBackups(backupsJson.data);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function createBackup() {
    setCreating(true);
    try {
      const response = await fetch("/api/monitoring/backup", { method: "POST" });
      const json = await response.json();
      if (json.ok) {
        toast("Резервная копия создана и проверена");
        await load();
      } else {
        toast(json.error ?? "Не удалось создать копию", "error");
      }
    } catch {
      toast("Ошибка создания копии", "error");
    } finally {
      setCreating(false);
    }
  }

  async function clearEvents() {
    const response = await fetch("/api/monitoring/events", { method: "DELETE" });
    const json = await response.json();
    if (json.ok) {
      setEvents([]);
      toast("Журнал очищен");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Мониторинг</h1>
          <p className="mt-0.5 text-sm text-slate-500">Состояние БД, почты, ошибки интерфейса и резервные копии.</p>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:text-white">Обновить</button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className={`rounded-xl border p-4 ${health?.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Состояние</p>
          <p className={`mt-1 text-xl font-bold ${health?.ok ? "text-emerald-300" : "text-red-300"}`}>{health?.status ?? "—"}</p>
          <p className="mt-1 text-[10px] text-slate-500">{health ? `${health.latencyMs} ms` : ""}</p>
        </div>
        {health && Object.entries(health.checks).map(([name, check]) => (
          <div key={name} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">{name}</p>
            <p className={`mt-1 text-sm font-semibold ${check.status === "ok" ? "text-emerald-300" : check.status === "error" ? "text-red-300" : "text-amber-300"}`}>
              {check.status === "ok" ? "OK" : check.status === "error" ? "Ошибка" : "Не настроено"}
            </p>
            {check.detail && <p className="mt-1 text-[10px] text-slate-600">{check.detail}</p>}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-white">Журнал ошибок</h2>
            <button type="button" onClick={() => void clearEvents()} className="text-xs text-slate-500 hover:text-red-300">Очистить</button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {events.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Ошибок не зафиксировано.</p>
            ) : events.map(event => (
              <div key={event.id} className="border-b border-slate-800/60 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded px-2 py-0.5 text-[10px] ${event.level === "error" ? "bg-red-500/10 text-red-300" : "bg-amber-500/10 text-amber-300"}`}>{event.level}</span>
                  <span className="text-[10px] text-slate-500">{event.source}</span>
                  <span className="text-[10px] text-slate-600">{new Date(event.createdAt).toLocaleString("ru-RU")}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{event.message}</p>
                {event.details && <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-2 text-[10px] text-slate-600">{event.details}</pre>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 p-4">
            <h2 className="text-sm font-semibold text-white">Резервные копии</h2>
            <button type="button" onClick={() => void createBackup()} disabled={creating} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {creating ? "Создание..." : "Создать"}
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {backups.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">Копий пока нет.</p>
            ) : backups.map(backup => (
              <div key={backup.name} className="border-b border-slate-800/60 p-4 text-xs">
                <p className="break-all font-medium text-slate-200">{backup.name}</p>
                <p className="mt-1 text-slate-500">{formatBytes(backup.size)} · {new Date(backup.createdAt).toLocaleString("ru-RU")}</p>
              </div>
            ))}
          </div>
          <p className="p-4 text-[10px] leading-relaxed text-slate-600">
            Скопировать вручную: `npm run db:backup`. Проверить последнюю копию: `npm run db:backup:check`.
          </p>
        </section>
      </div>
    </div>
  );
}
