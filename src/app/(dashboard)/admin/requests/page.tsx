"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";

interface Request {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message: string;
  status: string;
  createdAt: string;
}

const STATUSES = [
  { value: "new", label: "Новая", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "in_progress", label: "В работе", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { value: "done", label: "Готово", color: "bg-green-500/15 text-green-400 border-green-500/30" },
  { value: "archived", label: "Архив", color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
];

export default function AdminRequestsPage() {
  const [items, setItems] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/contact-requests")
      .then(r => r.json())
      .then(j => { if (j.ok) setItems(j.data); setLoading(false); });
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/contact-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    const json = await res.json();
    if (json.ok) {
      setItems(prev => prev.map(x => x.id === id ? { ...x, status } : x));
      toast("Статус обновлён");
    } else toast(json.error ?? "Ошибка", "error");
  }

  async function remove(id: string) {
    if (!confirm("Удалить заявку?")) return;
    const res = await fetch(`/api/contact-requests?id=${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) {
      setItems(prev => prev.filter(x => x.id !== id));
      toast("Удалено");
    } else toast(json.error ?? "Ошибка", "error");
  }

  const statusInfo = (s: string) => STATUSES.find(x => x.value === s) ?? STATUSES[0]!;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Заявки</h1>
        <p className="mt-0.5 text-sm text-slate-500">Обращения с сайта (форма обратной связи)</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 p-8 text-center">
          <p className="text-sm text-slate-500">Заявок пока нет.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(r => {
            const si = statusInfo(r.status);
            return (
              <div key={r.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{r.name}</p>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      {r.phone && <span>📞 {r.phone}</span>}
                      {r.email && <span>✉ {r.email}</span>}
                      <span>{new Date(r.createdAt).toLocaleString("ru-RU")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={r.status}
                      onChange={e => setStatus(r.id, e.target.value)}
                      className={`rounded-lg border bg-slate-900 px-2 py-1.5 text-xs text-white outline-none ${si.color}`}>
                      {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                    <button onClick={() => remove(r.id)}
                      className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-400 hover:border-red-500 hover:text-red-400">
                      Удалить
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-300">{r.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
