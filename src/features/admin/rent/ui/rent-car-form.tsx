"use client";

import UploadZone from "@/shared/ui/admin/upload-zone";
import FieldError from "@/shared/ui/field-error";
import { useEffect, useState } from "react";

interface FormData {
  name: string; slug: string; brandId: string; modelId: string; classId: string;
  year: string; color: string; transmission: string; fuel: string;
  engineVolume: string; seats: string; features: string;
  photos: string; mainPhoto: string; description: string;
  priceDay: string; price7Days: string; priceDayTaxi: string;
  rentTypeId: string; isActive: boolean; bookedUntil: string;
}

interface RentType { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[]; }
interface FuelItem { id: string; name: string; slug: string; }
interface TransItem { id: string; name: string; slug: string; }
interface ComfortItem { id: string; name: string; slug: string; }
interface CarClassItem { id: string; name: string; slug: string; deposit?: number; minAge?: number; }
interface ConditionItem { id: string; name: string; slug: string; placeholder?: string; }
interface SelectedCondition { conditionId: string; value: string; }

export default function RentCarForm({
  form, onChange, rentTypes, errors, initialConditions, onConditionsChange,
}: {
  form: FormData;
  onChange: (field: string, value: any) => void;
  rentTypes: RentType[];
  errors?: Record<string, string>;
  initialConditions?: SelectedCondition[];
  onConditionsChange?: (c: SelectedCondition[]) => void;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [fuels, setFuels] = useState<FuelItem[]>([]);
  const [transmissions, setTransmissions] = useState<TransItem[]>([]);
  const [comfortFeatures, setComfortFeatures] = useState<ComfortItem[]>([]);
  const [classes, setClasses] = useState<CarClassItem[]>([]);
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<SelectedCondition[]>(initialConditions ?? []);

  useEffect(() => {
    fetch("/api/cars").then(r => r.json()).then(j => { if (j.ok) setBrands(j.data); });
    fetch("/api/refs").then(r => r.json()).then(j => {
      if (j.ok) { setFuels(j.data.fuels); setTransmissions(j.data.transmissions); }
    });
    fetch("/api/comfort-features").then(r => r.json()).then(j => {
      if (j.ok) setComfortFeatures(j.data);
    });
    fetch("/api/rent/classes").then(r => r.json()).then(j => {
      if (j.ok) setClasses(j.data);
    });
    fetch("/api/rent/conditions").then(r => r.json()).then(j => {
      if (j.ok) setConditions(j.data);
    });
  }, []);

  function toggleCondition(id: string) {
    setSelectedConditions(prev => {
      const exists = prev.some(c => c.conditionId === id);
      const next = exists ? prev.filter(c => c.conditionId !== id) : [...prev, { conditionId: id, value: "" }];
      onConditionsChange?.(next);
      return next;
    });
  }

  function setConditionValue(id: string, value: string) {
    setSelectedConditions(prev => {
      const next = prev.map(c => c.conditionId === id ? { ...c, value } : c);
      onConditionsChange?.(next);
      return next;
    });
  }

  // Derived from form.brandId (no need for a separate effect/state)
  const selectedBrand = brands.find(b => b.id === form.brandId);
  const models = selectedBrand?.models ?? [];

  const eb = (key: string) => errors?.[key] ? "border-red-500" : "border-slate-700";
  const selectedType = rentTypes.find(t => t.id === form.rentTypeId);
  const isTaxi = selectedType?.slug === "taxi";
  const isRent = selectedType?.slug === "rent";

  const selectedFeatures: string[] = form.features ? form.features.split(",").filter(Boolean) : [];

  function toggleFeature(f: string) {
    const set = new Set(selectedFeatures);
    if (set.has(f)) set.delete(f); else set.add(f);
    onChange("features", [...set].join(","));
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Фото */}
      <div className="rounded-xl border border-slate-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">Фотографии ({photosCount(form.photos)} / 20)</p>
        </div>
        <UploadZone category="rent" label="Загрузить фото" multiple onUploadMultiple={urls => {
          const arr = photosArr(form.photos);
          const remaining = 20 - arr.length;
          const toAdd = urls.slice(0, remaining);
          if (toAdd.length === 0) return;
          const updated = [...arr, ...toAdd].join(",");
          onChange("photos", updated);
          if (!form.mainPhoto) onChange("mainPhoto", toAdd[0]);
        }} />
        {photosCount(form.photos) > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
            {photosArr(form.photos).map((url, i) => {
              const isMain = url === form.mainPhoto;
              return (
                <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-800">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {isMain && (
                    <span className="absolute left-1 top-1 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-medium text-white">Главная</span>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                    {!isMain && (
                      <button type="button" onClick={() => onChange("mainPhoto", url)}
                        className="rounded bg-white/20 px-2 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-white/40">Главная</button>
                    )}
                    <button type="button" onClick={() => {
                      const arr = photosArr(form.photos);
                      arr.splice(i, 1);
                      onChange("photos", arr.join(","));
                      if (isMain) onChange("mainPhoto", arr[0] ?? "");
                    }}
                      className="rounded bg-red-600/80 px-2 py-1 text-[10px] text-white hover:bg-red-600">×</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Основное */}
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Основное</legend>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Название *</span>
            <input value={form.name} onChange={e => onChange("name", e.target.value)}
              className={`rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("name")}`} />
            <FieldError error={errors?.name} /></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Slug</span>
            <input value={form.slug} onChange={e => onChange("slug", e.target.value)}
              className={`rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("slug")}`} />
            <FieldError error={errors?.slug} /></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Марка</span>
            <select value={form.brandId} onChange={e => { onChange("brandId", e.target.value); onChange("modelId", ""); }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Модель</span>
            <select value={form.modelId} onChange={e => onChange("modelId", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Класс</span>
            <select value={form.classId} onChange={e => onChange("classId", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Без класса</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Год</span>
            <input type="number" value={form.year} onChange={e => onChange("year", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Цвет</span>
            <input value={form.color} onChange={e => onChange("color", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Коробка</span>
            <select value={form.transmission} onChange={e => onChange("transmission", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {transmissions.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Топливо</span>
            <select value={form.fuel} onChange={e => onChange("fuel", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {fuels.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Объём двигателя</span>
            <input value={form.engineVolume} onChange={e => onChange("engineVolume", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" placeholder="2.0" /></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Мест</span>
            <input type="number" value={form.seats} onChange={e => onChange("seats", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
          <label className="flex flex-col gap-1 col-span-2"><span className="text-xs text-slate-400">Описание</span>
            <textarea value={form.description} onChange={e => onChange("description", e.target.value)} rows={3}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        </div>
      </fieldset>

      {/* Тип аренды */}
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Тип аренды</legend>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Тип</span>
            <select value={form.rentTypeId} onChange={e => onChange("rentTypeId", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {rentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></label>
          <label className="flex items-center gap-2 self-end pb-2">
            <input type="checkbox" checked={form.isActive} onChange={e => onChange("isActive", e.target.checked)}
              className="h-4 w-4 accent-red-600" />
            <span className="text-sm text-slate-400">Активно</span>
          </label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Забронирован до</span>
            <input type="date" value={form.bookedUntil} onChange={e => onChange("bookedUntil", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        </div>
      </fieldset>

      {/* Цены */}
      {selectedType && (
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Цены (BYN)</legend>
        {isRent && (
          <>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PriceInput label="За сутки (базовая)" value={form.priceDay} onChange={v => onChange("priceDay", v)} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Скидки за длительный срок (3–7, 8–14, 15–31 суток) задаются в настройках калькулятора.
            </p>
          </>
        )}
        {isTaxi && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-4">
              <PriceInput label="За неделю" value={form.price7Days} onChange={v => onChange("price7Days", v)} />
              <PriceInput label="В день (среднее)" value={form.priceDayTaxi} onChange={v => onChange("priceDayTaxi", v)} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Такси — аренда только от недели, цена за неделю.</p>
          </>
        )}
      </fieldset>
      )}

      {/* Комфорт */}
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Комфорт и опции</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {comfortFeatures.map(f => (
            <label key={f.id} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:border-slate-500"
              style={selectedFeatures.includes(f.name) ? { borderColor: "#ef4444", backgroundColor: "#ef444410" } : {}}>
              <input type="checkbox" checked={selectedFeatures.includes(f.name)} onChange={() => toggleFeature(f.name)}
                className="hidden" />
              {f.name}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Условия аренды */}
      {conditions.length > 0 && (
        <fieldset className="rounded-xl border border-slate-800 p-4">
          <legend className="px-1 text-xs font-medium text-slate-400">Условия аренды</legend>
          <p className="mt-1 text-xs text-slate-500">Отметьте галочкой условие — оно отобразится на странице авто.</p>
          <div className="mt-3 flex flex-col gap-3">
            {conditions.map(c => {
              const sel = selectedConditions.find(s => s.conditionId === c.id);
              return (
                <div key={c.id} className={`rounded-lg border p-3 transition ${sel ? "border-red-500/50 bg-red-500/5" : "border-slate-800"}`}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={!!sel} onChange={() => toggleCondition(c.id)} className="h-4 w-4 accent-red-600" />
                    <span className="text-sm text-white">{c.name}</span>
                  </label>
                  {sel && (
                    <input value={sel.value} onChange={e => setConditionValue(c.id, e.target.value)}
                      placeholder={c.placeholder ?? "Значение"}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}

function photosCount(photos: string) { return photos ? photos.split(",").filter(Boolean).length : 0; }
function photosArr(photos: string) { return photos ? photos.split(",").filter(Boolean) : []; }

function PriceInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 pr-8 text-sm text-white outline-none focus:border-red-500" />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">BYN</span>
      </div>
    </label>
  );
}
