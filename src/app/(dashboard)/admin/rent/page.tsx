"use client";

import { useEffect, useState, useCallback } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import RentCarForm from "@/features/admin/rent/ui/rent-car-form";
import RentCarHistoryPanel from "@/features/admin/rent/ui/rent-car-history-panel";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { getPriceLabel } from "@/shared/lib/price";
import { TRANSMISSION_LABEL, FUEL_LABEL } from "@/shared/lib/car-dictionaries";

interface RentType { id: string; name: string; slug: string; sortOrder: number; }

interface RentCar {
  id: string; name: string; slug: string; brandId?: string; modelId?: string;
  brand?: string; model?: string; classId?: string; class?: string;
  year?: number; color?: string; transmission?: string; fuel?: string;
  engineVolume?: string; seats?: number; features?: string; description?: string;
  priceDay?: number; price7Days?: number; priceDayTaxi?: number;
  rentTypeId?: string; rentType?: { id: string; name: string; slug: string };
  isActive: boolean; bookedUntil?: string; photos?: string; mainPhoto?: string;
  conditions?: { conditionId: string; name: string; value: string }[];
}

const EMPTY_FORM = {
  name: "", slug: "", brandId: "", modelId: "", classId: "", year: "", color: "",
  transmission: "", fuel: "", engineVolume: "", seats: "", features: "",
  photos: "", mainPhoto: "", description: "",
  priceDay: "", price7Days: "", priceDayTaxi: "",
  rentTypeId: "", isActive: true, bookedUntil: "",
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
  const [carConditions, setCarConditions] = useState<{ conditionId: string; value: string }[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    const [cRes, tRes] = await Promise.all([
      fetch("/api/rent?showAll=true").then(r => r.json()),
      fetch("/api/rent?types=true").then(r => r.json()),
    ]);
    if (cRes.ok) setCars(cRes.data);
    if (tRes.ok) setTypes(tRes.data);
    setLoading(false);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, []);

  function setFormField(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }) as typeof prev);
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function openCreate() { setForm({ ...EMPTY_FORM }); setEditing(null); setCarConditions([]); setFormErrors({}); setModal(true); }

  function openEdit(c: RentCar) {
    setForm({
      name: c.name, slug: c.slug,
      brandId: c.brandId ?? "", modelId: c.modelId ?? "", classId: c.classId ?? "",
      year: c.year?.toString() ?? "", color: c.color ?? "",
      transmission: c.transmission ?? "", fuel: c.fuel ?? "",
      engineVolume: c.engineVolume ?? "", seats: c.seats?.toString() ?? "",
      features: c.features ?? "", photos: c.photos ?? "", mainPhoto: c.mainPhoto ?? "", description: c.description ?? "",
      priceDay: c.priceDay?.toString() ?? "",
      price7Days: c.price7Days?.toString() ?? "", priceDayTaxi: c.priceDayTaxi?.toString() ?? "",
      rentTypeId: c.rentTypeId ?? "", isActive: c.isActive, bookedUntil: c.bookedUntil ?? "",
    });
    setCarConditions((c.conditions ?? []).map(x => ({ conditionId: x.conditionId, value: x.value })));
    setFormErrors({});
    setEditing(c);
    setModal(true);
  }

  const NUM_FIELDS = new Set(["year", "seats", "priceDay", "price7Days", "priceDayTaxi", "sortOrder"]);

  const handleSave = useCallback(async () => {
    const type = types.find(t => t.id === form.rentTypeId);
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Укажите название";
    if (!form.slug.trim()) errors.slug = "Укажите slug";
    if (!form.rentTypeId) errors.rentTypeId = "Выберите тип аренды";
    if (type?.slug === "taxi" && !form.price7Days) errors.price7Days = "Укажите цену за неделю";
    if (type?.slug === "rent" && !form.priceDay) errors.priceDay = "Укажите цену за сутки";
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast("Заполните обязательные поля", "error");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v === "" || v === null || v === undefined) { body[k] = null; continue; }
        body[k] = NUM_FIELDS.has(k) ? Number(v) : v;
      }
      body.conditions = carConditions;
      const url = editing ? `/api/rent/${editing.id}` : "/api/rent";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };
      if (json.ok) {
        setModal(false);
        setFormErrors({});
        await load();
        toast(editing ? "Сохранено" : "Авто добавлено");
      } else {
        toast(json.error ?? "Ошибка", "error");
      }
    } catch { toast("Ошибка при сохранении", "error"); }
    setSaving(false);
  }, [form, editing, carConditions, toast, types, load]);

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
          <h1 className="text-2xl font-bold">Аренда</h1>
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
                <th className="px-4 py-3 font-medium text-slate-400">Класс</th>
                <th className="px-4 py-3 font-medium text-slate-400">Характеристики</th>
                <th className="px-4 py-3 font-medium text-slate-400">Цена</th>
                <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {cars.map(c => (
                <tr key={c.id} className={`border-b border-slate-800/50 hover:bg-slate-900/50 ${!c.isActive && !c.bookedUntil ? "opacity-50" : ""}`}>
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
                  <td className="px-4 py-3">
                    {c.class ? (
                      <span className="rounded bg-blue-900/40 px-2 py-0.5 text-xs text-blue-300">{c.class}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {TRANSMISSION_LABEL[c.transmission ?? ""] ?? c.transmission}
                    {c.transmission && c.fuel && " · "}
                    {FUEL_LABEL[c.fuel ?? ""] ?? c.fuel}
                    {c.seats && ` · ${c.seats} мест`}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400">
                    {getPriceLabel(c) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {c.bookedUntil && new Date(c.bookedUntil) > new Date() ? (
                      <span className="rounded bg-amber-900/50 px-2 py-0.5 text-xs text-amber-300">
                        Бронь до {new Date(c.bookedUntil).toLocaleDateString("ru-RU")}
                      </span>
                    ) : c.isActive ? (
                      <span className="rounded bg-green-900/50 px-2 py-0.5 text-xs text-green-300">Активен</span>
                    ) : (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-500">Скрыт</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <a href={`/services/rent/${c.slug}`} target="_blank" rel="noopener noreferrer" className="rounded px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-800 hover:text-white">Сайт ↗</a>
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
      <AdminModal open={modal} onClose={() => setModal(false)} size="xl" title={editing ? "Редактировать авто" : "Новый автомобиль"}>
        <RentCarForm key={editing?.id ?? "new"} form={form} onChange={setFormField} rentTypes={types}
          errors={formErrors} initialConditions={carConditions} onConditionsChange={setCarConditions} />
        {editing && <RentCarHistoryPanel carId={editing.id} />}
        <div className="sticky bottom-0 -mx-6 mt-5 flex items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4">
          <div className="min-w-0">
            {editing && (
              <a href={`/services/rent/${editing.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white">
                Открыть на сайте ↗
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
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
