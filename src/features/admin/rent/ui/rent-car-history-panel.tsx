"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toat-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

interface HistoryEntry {
  id: string;
  carId: string;
  type: string;
  description?: string;
  amount?: number;
  date: string;
}

const HISTORY_TYPES = [
  { value: "service", label: "Обслуживание" },
  { value: "repair", label: "Ремонт" },
  { value: "insurance", label: "Страховка" },
  { value: "tax", label: "Налог" },
  { value: "washing", label: "Мойка" },
  { value: "fuel", label: "Топливо" },
  { value: "booking", label: "Бронь" },
  { value: "other", label: "Прочее" },
];

export default function RentCarHistoryPanel({ carId }: { carId: string }) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "service", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/rent/${encodeURIComponent(carId)}/history`);
    const json = await res.json();
    if (json.ok) setEntries(json.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [carId]);

  async function addEntry() {
    if (!form.description && !form.amount) return;
    setSaving(true);
    const res = await fetch(`/api/rent/${encodeURIComponent(carId)}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        description: form.description || null,
        amount: form.amount ? parseInt(form.amount) : null,
        date: form.date,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      setForm({ type: "service", description: "", amount: "", date: new Date().toISOString().slice(0, 10) });
      await load();
      toast("Запись добавлена");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
    setSaving(false);
  }

  async function removeEntry(id: string) {
    const ok = await confirm({ title: "Удалить запись?", message: "Удалить эту запись из истории?", confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/${encodeURIComponent(carId)}/history`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
    toast("Запись удалена");
  }

  const typeLabel = (t: string) => HISTORY_TYPES.find(x => x.value === t)?.label ?? t;

  return (
    <div className="mt-6 rounded-xl border border-slate-800">
      <div className="border-b border-slate-800 px-4 py-3">
        <h3 className="text-sm font-medium text-slate-300">История автомобиля</h3>
      </div>

      {/* Add form */}
      <div className="border-b border-slate-800 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500">Тип</span>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-red-500">
              {HISTORY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500">Описание</span>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-red-500" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500">Сумма (BYN)</span>
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-red-500" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-500">Дата</span>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white outline-none focus:border-red-500" />
          </label>
          <div className="flex items-end">
            <button onClick={addEntry} disabled={saving}
              className="w-full rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? "..." : "+ Добавить"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="px-4 py-6 text-center text-xs text-slate-600">Загрузка...</p>
        ) : entries.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-600">Нет записей в истории</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/50">
              <tr>
                <th className="px-4 py-2 font-medium text-slate-500">Дата</th>
                <th className="px-4 py-2 font-medium text-slate-500">Тип</th>
                <th className="px-4 py-2 font-medium text-slate-500">Описание</th>
                <th className="px-4 py-2 font-medium text-slate-500">Сумма</th>
                <th className="w-12 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
                  <td className="px-4 py-2 text-slate-400">{new Date(e.date).toLocaleDateString("ru-RU")}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">{typeLabel(e.type)}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-400">{e.description ?? "—"}</td>
                  <td className="px-4 py-2">
                    {e.amount != null ? (
                      <span className={e.amount >= 0 ? "text-green-400" : "text-red-400"}>
                        {e.amount} BYN
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={() => removeEntry(e.id)}
                      className="text-slate-600 hover:text-red-400">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {dialog}
    </div>
  );
}
