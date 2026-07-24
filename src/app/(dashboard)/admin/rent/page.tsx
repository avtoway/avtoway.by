"use client";

import { useEffect, useState, useCallback } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import RentCarForm from "@/features/admin/rent/ui/rent-car-form";
import { useToast } from "@/shared/lib/toat-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

interface RentType { id: string; name: string; slug: string; sortOrder: number; }

interface RentCar {
  id: string; name: string; slug: string; brand?: string; model?: string;
  year?: number; transmission?: string; fuel?: string; seats?: number;
  priceDay?: number; price3Days?: number; price7Days?: number;
  rentTypeId?: string; rentType?: { id: string; name: string };
  isActive: boolean; photos?: string; mainPhoto?: string;
}

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат", manual: "Механика", robot: "Робот", variator: "Вариатор",
};

const FUEL_LABEL: Record<string, string> = {
  gasoline: "Бензин", diesel: "Дизель", electric: "Электро", hybrid: "Гибрид",
  propane: "Газ (пропан)", methane: "Газ (метан)",
};

const EMPTY_FORM = {
  name: "", slug: "", brand: "", model: "", year: "", color: "",
  transmission: "", fuel: "", engineVolume: "", seats: "", features: "",
  photos: "", mainPhoto: "", description: "",
  priceDay: "", price3Days: "", price7Days: "", priceMonth: "",
  priceWeekTaxi: "", priceDayTaxi: "",
  rentTypeId: "", isActive: true,
};

export default function AdminRentPage() {
  const [cars, setCars] = useState<RentCar[]>([]);
  const [types, setTypes] = useState<RentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RentCar | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [typeModal, setTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeSlug, setNewTypeSlug] = useState("");
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    const [cRes, tRes] = await Promise.all([
      fetch("/api/rent").then(r => r.json()),
      fetch("/api/rent?types=true").then(r => r.json()),
    ]);
    if (cRes.ok) setCars(cRes.data);
    if (tRes.ok) setTypes(tRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function setFormField(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function openCreate() { setForm({ ...EMPTY_FORM }); setEditing(null); setModal(true); }

  function openEdit(c: RentCar) {
    setForm({
      name: c.name, slug: c.slug,
      brand: c.brand ?? "", model: c.model ?? "",
      year: c.year?.toString() ?? "", color: "",
      transmission: c.transmission ?? "", fuel: c.fuel ?? "",
      engineVolume: "", seats: c.seats?.toString() ?? "",
      features: "", photos: c.photos ?? "", mainPhoto: c.mainPhoto ?? "", description: "",
      priceDay: c.priceDay?.toString() ?? "", price3Days: c.price3Days?.toString() ?? "",
      price7Days: c.price7Days?.toString() ?? "", priceMonth: "",
      priceWeekTaxi: "", priceDayTaxi: "",
      rentTypeId: c.rentTypeId ?? "", isActive: c.isActive,
    });
    setEditing(c);
    setModal(true);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    const body: Record<string, any> = {};
    for (const [k, v] of Object.entries(form)) {
      body[k] = v === "" ? null : v;
    }
    const url = editing ? `/api/rent/${editing.id}` : "/api/rent";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { setModal(false); await load(); toast(editing ? "Сохранено" : "Авто добавлено"); }
    else toast(json.error ?? "Ошибка", "error");
    setSaving(false);
  }, [form, editing, toast]);

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({ title: "Удаление авто", message: `Удалить «${name}»?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/${id}`, { method: "DELETE" });
    await load();
    toast("Авто удалено");
  }

  async function addRentType() {
    if (!newTypeName || !newTypeSlug) return;
    const res = await fetch("/api/rent/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeName, slug: newTypeSlug }),
    });
    const json = await res.json();
    if (json.ok) { setTypeModal(false); setNewTypeName(""); setNewTypeSlug(""); await load(); toast("Тип добавлен"); }
    else toast(json.error ?? "Ошибка", "error");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Аренда авто</h1>
          <p className="mt-0.5 text-sm text-slate-500">Управление автомобилями</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTypeModal(true)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
            + Тип аренды
          </button>
          <button onClick={openCreate}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            + Добавить авто
          </button>
        </div>
      </div>

      {loading ? <p className="text-slate-500">Загрузка...</p> : cars.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Нет автомобилей. Добавьте первый.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Тип</th>
                <th className="px-4 py-3 font-medium text-slate-400">Характеристики</th>
                <th className="px-4 py-3 font-medium text-slate-400">Цена</th>
                <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {cars.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.photos && (
                        <img src={c.photos.split(",")[0]} alt={c.name}
                          className="h-10 w-14 rounded object-cover bg-slate-800" />
                      )}
                      <div>
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-600">{c.brand} {c.model} · {c.year} г.</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{c.rentType?.name}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {TRANSMISSION_LABEL[c.transmission ?? ""] ?? c.transmission}
                    {c.transmission && c.fuel && " · "}
                    {FUEL_LABEL[c.fuel ?? ""] ?? c.fuel}
                    {c.seats && ` · ${c.seats} мест`}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {c.priceDay ? `${c.priceDay} ₽/день` : c.price7Days ? `${c.price7Days} ₽/нед` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 text-xs ${c.isActive ? "bg-green-900/50 text-green-300" : "bg-slate-800 text-slate-500"}`}>
                      {c.isActive ? "Активен" : "Скрыт"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Car modal */}
      <AdminModal open={modal} onClose={() => setModal(false)} size="lg" title={editing ? "Редактировать авто" : "Новый автомобиль"}>
        <RentCarForm form={form} onChange={setFormField} rentTypes={types} />
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
          <button onClick={handleSave} disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </AdminModal>

      {/* Type modal */}
      <AdminModal open={typeModal} onClose={() => setTypeModal(false)} title="Новый тип аренды">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Название</span>
            <input value={newTypeName} onChange={e => setNewTypeName(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">Slug</span>
            <input value={newTypeSlug} onChange={e => setNewTypeSlug(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
              placeholder="podkat, rent, taxi" />
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setTypeModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Отмена</button>
          <button onClick={addRentType} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Добавить</button>
        </div>
      </AdminModal>

      {dialog}
    </div>
  );
}
