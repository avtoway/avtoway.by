"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

interface RentRequest {
  id: string;
  car?: { id: string; name: string; slug: string };
  name: string;
  phone?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  days?: number;
  total?: number;
  deposit?: number;
  status: string;
  message?: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "Новая", style: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  { value: "in_progress", label: "В работе", style: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  { value: "done", label: "Завершена", style: "bg-green-500/15 text-green-400 border-green-500/30" },
  { value: "cancelled", label: "Отменена", style: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" },
];

export default function RentRequestsPanel() {
  const [items, setItems] = useState<RentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/rent/requests", { cache: "no-store" });
      const json = await response.json();
      if (json.ok) setItems(json.data);
      else toast(json.error ?? "Не удалось загрузить заявки", "error");
    } catch {
      toast("Не удалось загрузить заявки", "error");
    }
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/rent/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await response.json();
    if (json.ok) {
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
      toast("Статус заявки обновлён");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  async function remove(item: RentRequest) {
    const ok = await confirm({
      title: "Удаление заявки",
      message: `Удалить заявку от ${item.name}?`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;

    const response = await fetch(`/api/rent/requests/${item.id}`, { method: "DELETE" });
    const json = await response.json();
    if (json.ok) {
      setItems((prev) => prev.filter((row) => row.id !== item.id));
      toast("Заявка удалена");
    } else {
      toast(json.error ?? "Ошибка", "error");
    }
  }

  const statusInfo = (status: string) => STATUS_OPTIONS.find((item) => item.value === status) ?? STATUS_OPTIONS[0]!;

  if (loading) return <p className="text-slate-500">Загрузка...</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 py-16 text-center">
        <p className="text-sm text-slate-500">Заявок на аренду пока нет.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-400">Клиент</th>
              <th className="px-4 py-3 font-medium text-slate-400">Автомобиль</th>
              <th className="px-4 py-3 font-medium text-slate-400">Период</th>
              <th className="px-4 py-3 font-medium text-slate-400">Сумма</th>
              <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
              <th className="px-4 py-3 font-medium text-slate-400">Создана</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = statusInfo(item.status);
              return (
                <tr key={item.id} className="border-b border-slate-800/50 align-top hover:bg-slate-900/40">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{item.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                      {item.phone && <p>{item.phone}</p>}
                      {item.email && <p className="break-all">{item.email}</p>}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">
                    {item.car?.name ?? "Автомобиль удалён"}
                    {item.days && <p className="mt-1 text-[10px] text-slate-600">{item.days} дн.</p>}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-400">
                    {item.startDate ?? "—"} → {item.endDate ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-emerald-400">{item.total ? `${item.total} BYN` : "—"}</p>
                    {item.deposit && <p className="mt-1 text-[10px] text-slate-600">залог {item.deposit} BYN</p>}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={item.status}
                      onChange={(event) => updateStatus(item.id, event.target.value)}
                      className={`rounded-lg border bg-slate-900 px-2 py-1.5 text-xs text-white outline-none ${status.style}`}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString("ru-RU")}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      {item.car?.slug && (
                        <a
                          href={`/services/rent/${item.car.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          Авто ↗
                        </a>
                      )}
                      <button
                        onClick={() => remove(item)}
                        className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300"
                      >
                        Удл
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {dialog}
    </>
  );
}
