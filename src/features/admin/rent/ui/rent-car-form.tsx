"use client";

import UploadZone from "@/shared/ui/admin/upload-zone";
import FieldError from "@/shared/ui/field-error";
import { useEffect, useState } from "react";

const TRANSMISSIONS = [
  { value: "auto", label: "Автомат" },
  { value: "manual", label: "Механика" },
  { value: "robot", label: "Робот" },
  { value: "variator", label: "Вариатор" },
];

const FUELS = [
  { value: "gasoline", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "electric", label: "Электро" },
  { value: "hybrid", label: "Гибрид" },
  { value: "propane", label: "Газ (пропан)" },
  { value: "methane", label: "Газ (метан)" },
];

const FEATURES_LIST = [
  "Кондиционер", "Климат-контроль", "Подогрев сидений",
  "Вентиляция сидений", "Люк", "Панорамная крыша",
  "Навигация", "Apple CarPlay", "Android Auto",
  "Bluetooth", "Круиз-контроль", "Парктроники",
  "Камера заднего вида", "Кожаный салон",
];

interface FormData {
  name: string; slug: string; brand: string; model: string;
  year: string; color: string; transmission: string; fuel: string;
  engineVolume: string; seats: string; features: string;
  photos: string; mainPhoto: string; description: string;
  priceDay: string; price3Days: string; price7Days: string; priceMonth: string;
  priceWeekTaxi: string; priceDayTaxi: string;
  rentTypeId: string; isActive: boolean;
}

interface RentType { id: string; name: string; slug: string; }
interface Brand { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[]; }

export default function RentCarForm({
  form, onChange, rentTypes, errors,
}: {
  form: FormData;
  onChange: (field: string, value: any) => void;
  rentTypes: RentType[];
  errors?: Record<string, string>;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Brand["models"]>([]);

  useEffect(() => {
    fetch("/api/cars").then(r => r.json()).then(j => { if (j.ok) setBrands(j.data); });
  }, []);

  useEffect(() => {
    if (form.brand) {
      const brand = brands.find(b => b.slug === form.brand || b.name === form.brand);
      setModels(brand?.models ?? []);
    } else {
      setModels([]);
    }
  }, [form.brand, brands]);

  const eb = (key: string) => errors?.[key] ? "border-red-500" : "border-slate-700";

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
        <UploadZone label="Загрузить фото" multiple onUploadMultiple={urls => {
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
            <select value={form.brand} onChange={e => { onChange("brand", e.target.value); onChange("model", ""); }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Модель</span>
            <select value={form.model} onChange={e => onChange("model", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {models.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}
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
              {TRANSMISSIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select></label>
          <label className="flex flex-col gap-1"><span className="text-xs text-slate-400">Топливо</span>
            <select value={form.fuel} onChange={e => onChange("fuel", e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Выберите</option>
              {FUELS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
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
        </div>
      </fieldset>

      {/* Цены */}
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Цены (BYN)</legend>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <PriceInput label="За сутки" value={form.priceDay} onChange={v => onChange("priceDay", v)} />
          <PriceInput label="На 3 дня" value={form.price3Days} onChange={v => onChange("price3Days", v)} />
          <PriceInput label="На 7 дней" value={form.price7Days} onChange={v => onChange("price7Days", v)} />
          <PriceInput label="На месяц" value={form.priceMonth} onChange={v => onChange("priceMonth", v)} />
          <PriceInput label="Такси — неделя" value={form.priceWeekTaxi} onChange={v => onChange("priceWeekTaxi", v)} />
          <PriceInput label="Такси — день (среднее)" value={form.priceDayTaxi} onChange={v => onChange("priceDayTaxi", v)} />
        </div>
      </fieldset>

      {/* Комфорт */}
      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Комфорт и опции</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURES_LIST.map(f => (
            <label key={f} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:border-slate-500"
              style={selectedFeatures.includes(f) ? { borderColor: "#ef4444", backgroundColor: "#ef444410" } : {}}>
              <input type="checkbox" checked={selectedFeatures.includes(f)} onChange={() => toggleFeature(f)}
                className="hidden" />
              {f}
            </label>
          ))}
        </div>
      </fieldset>
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
