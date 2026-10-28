"use client";

import { useEffect, useMemo, useState } from "react";
import FieldError from "@/shared/ui/field-error";
import PhotoManager from "@/shared/ui/admin/photo-manager";
import { slugify } from "@/shared/lib/slug";

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

type Tab = "main" | "photos" | "pricing" | "options";

const field = "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-red-500";
const label = "flex flex-col gap-1";

export default function RentCarForm({
  form, onChange, rentTypes, errors, initialConditions, onConditionsChange,
}: {
  form: FormData;
  onChange: (field: string, value: unknown) => void;
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
  const [tab, setTab] = useState<Tab>("main");
  const [featureSearch, setFeatureSearch] = useState("");
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/cars").then(r => r.json()).then(j => { if (j.ok) setBrands(j.data); }).catch(() => undefined);
    fetch("/api/refs").then(r => r.json()).then(j => {
      if (j.ok) { setFuels(j.data.fuels); setTransmissions(j.data.transmissions); }
    }).catch(() => undefined);
    fetch("/api/comfort-features").then(r => r.json()).then(j => {
      if (j.ok) setComfortFeatures(j.data);
    }).catch(() => undefined);
    fetch("/api/rent/classes").then(r => r.json()).then(j => {
      if (j.ok) setClasses(j.data);
    }).catch(() => undefined);
    fetch("/api/rent/conditions").then(r => r.json()).then(j => {
      if (j.ok) setConditions(j.data);
    }).catch(() => undefined);
    fetch("/api/exchange-rate").then(r => r.json()).then(j => {
      if (j.ok) setUsdRate(j.rate);
    }).catch(() => undefined);
  }, []);

  const selectedBrand = brands.find(b => b.id === form.brandId);
  const models = selectedBrand?.models ?? [];
  const selectedType = rentTypes.find(t => t.id === form.rentTypeId);
  const isTaxi = selectedType?.slug === "taxi";
  const isRent = selectedType?.slug === "rent";
  const selectedFeatures = useMemo(
    () => form.features ? form.features.split(",").map(f => f.trim()).filter(Boolean) : [],
    [form.features],
  );
  const photos = form.photos ? form.photos.split(",").filter(Boolean) : [];

  const eb = (key: string) => errors?.[key] ? "border-red-500" : "border-slate-700";

  function toggleFeature(feature: string) {
    const set = new Set(selectedFeatures);
    if (set.has(feature)) set.delete(feature); else set.add(feature);
    onChange("features", [...set].join(","));
  }

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

  function autoFillName() {
    const brand = selectedBrand?.name ?? "";
    const model = models.find(m => m.id === form.modelId)?.name ?? "";
    const name = [brand, model, form.year].filter(Boolean).join(" ").trim();
    if (!name) return;
    onChange("name", name);
    onChange("slug", slugify(name));
  }

  const tabs: Array<{ key: Tab; label: string; hint?: string }> = [
    { key: "main", label: "Основное" },
    { key: "photos", label: "Фото", hint: String(photos.length) },
    { key: "pricing", label: "Цены и аренда" },
    { key: "options", label: "Опции и условия", hint: String(selectedFeatures.length || "") },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 -mx-1 flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-950 px-1 pb-2">
        {tabs.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tab === item.key ? "bg-red-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {item.label}
            {item.hint && <span className={`ml-1 text-[10px] ${tab === item.key ? "text-white/70" : "text-slate-600"}`}>{item.hint}</span>}
          </button>
        ))}
      </div>

      {tab === "photos" && (
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
            <p className="text-sm font-medium text-white">Фотографии автомобиля</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              До 40 фото: экстерьер, салон, багажник, двигатель. Первое фото становится главным в каталоге. Можно перетаскивать файлы и менять порядок стрелками.
            </p>
          </div>
          <PhotoManager
            category="rent"
            max={40}
            photos={photos}
            mainPhoto={form.mainPhoto}
            onChange={(nextPhotos, mainPhoto) => {
              onChange("photos", nextPhotos.join(","));
              onChange("mainPhoto", mainPhoto);
            }}
          />
        </div>
      )}

      {tab === "main" && (
        <>
          <fieldset className="rounded-xl border border-slate-800 p-4">
            <legend className="px-1 text-xs font-medium text-slate-400">Основное</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className={`${label} sm:col-span-2`}>
                <span className="text-xs text-slate-400">Название *</span>
                <div className="flex gap-2">
                  <input value={form.name} onChange={e => onChange("name", e.target.value)}
                    className={`${field} ${eb("name")} flex-1`} placeholder="Hyundai Solaris" />
                  <button type="button" onClick={autoFillName} className="shrink-0 rounded-lg border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800">
                    Заполнить
                  </button>
                </div>
                <FieldError error={errors?.name} />
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Slug</span>
                <div className="flex gap-2">
                  <input value={form.slug} onChange={e => onChange("slug", e.target.value)}
                    className={`${field} ${eb("slug")} flex-1`} placeholder="hyundai-solaris-2021" />
                  <button type="button" onClick={() => onChange("slug", slugify(form.name))} className="shrink-0 rounded-lg border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800">
                    Из названия
                  </button>
                </div>
                <FieldError error={errors?.slug} />
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Марка</span>
                <select value={form.brandId} onChange={e => { onChange("brandId", e.target.value); onChange("modelId", ""); }} className={`${field} ${eb("brandId")}`}>
                  <option value="">Выберите марку</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Модель</span>
                <select value={form.modelId} onChange={e => onChange("modelId", e.target.value)} className={field}>
                  <option value="">Выберите модель</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Класс</span>
                <select value={form.classId} onChange={e => onChange("classId", e.target.value)} className={field}>
                  <option value="">Без класса</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Год выпуска</span>
                <input type="number" value={form.year} onChange={e => onChange("year", e.target.value)} className={field} />
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Цвет</span>
                <input value={form.color} onChange={e => onChange("color", e.target.value)} className={field} placeholder="Белый, чёрный металлик..." />
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Коробка</span>
                <select value={form.transmission} onChange={e => onChange("transmission", e.target.value)} className={field}>
                  <option value="">Выберите</option>
                  {transmissions.map(t => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Топливо</span>
                <select value={form.fuel} onChange={e => onChange("fuel", e.target.value)} className={field}>
                  <option value="">Выберите</option>
                  {fuels.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Объём двигателя</span>
                <input value={form.engineVolume} onChange={e => onChange("engineVolume", e.target.value)} className={field} placeholder="2.0" />
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Мест</span>
                <input type="number" value={form.seats} onChange={e => onChange("seats", e.target.value)} className={field} />
              </label>
              <label className={`${label} sm:col-span-2`}>
                <span className="text-xs text-slate-400">Описание для карточки</span>
                <textarea value={form.description} onChange={e => onChange("description", e.target.value)} rows={4}
                  className={`${field} resize-none`} placeholder="Коротко: для каких задач подходит авто, что включено в аренду." />
              </label>
            </div>
          </fieldset>
        </>
      )}

      {tab === "pricing" && (
        <>
          <fieldset className="rounded-xl border border-slate-800 p-4">
            <legend className="px-1 text-xs font-medium text-slate-400">Тип аренды и доступность</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <label className={label}>
                <span className="text-xs text-slate-400">Тип</span>
                <select value={form.rentTypeId} onChange={e => onChange("rentTypeId", e.target.value)} className={field}>
                  <option value="">Выберите</option>
                  {rentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </label>
              <label className={label}>
                <span className="text-xs text-slate-400">Забронирован до</span>
                <input type="date" value={form.bookedUntil} onChange={e => onChange("bookedUntil", e.target.value)} className={field} />
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-300">
                <input type="checkbox" checked={form.isActive} onChange={e => onChange("isActive", e.target.checked)} className="h-4 w-4 accent-red-600" />
                Показывать в каталоге
              </label>
            </div>
          </fieldset>

          {selectedType && (
            <fieldset className="rounded-xl border border-slate-800 p-4">
              <legend className="px-1 text-xs font-medium text-slate-400">Цены (BYN)</legend>
              {isRent && (
                <>
                  <div className="mt-3 max-w-sm">
                    <PriceInput label="За сутки (базовая)" value={form.priceDay} onChange={v => onChange("priceDay", v)} usdRate={usdRate} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    Скидки за длительный срок (3–7, 8–14, 15–30, 31+ суток) задаются в настройках калькулятора.
                  </p>
                </>
              )}
              {isTaxi && (
                <>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <PriceInput label="За неделю" value={form.price7Days} onChange={v => onChange("price7Days", v)} usdRate={usdRate} />
                    <PriceInput label="В день (среднее)" value={form.priceDayTaxi} onChange={v => onChange("priceDayTaxi", v)} usdRate={usdRate} />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">Такси — аренда только от недели, цена указывается за неделю.</p>
                </>
              )}
            </fieldset>
          )}
        </>
      )}

      {tab === "options" && (
        <>
          <fieldset className="rounded-xl border border-slate-800 p-4">
            <legend className="px-1 text-xs font-medium text-slate-400">Комфорт и опции</legend>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input value={featureSearch} onChange={e => setFeatureSearch(e.target.value)} placeholder="Поиск опции..."
                className={`${field} w-full sm:max-w-xs`} />
              <button type="button" onClick={() => onChange("features", comfortFeatures.slice(0, 8).map(f => f.name).join(","))}
                className="text-xs text-red-400 hover:text-red-300">Выбрать популярные</button>
              <button type="button" onClick={() => onChange("features", "")} className="text-xs text-slate-500 hover:text-slate-300">Снять все</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {comfortFeatures
                .filter(f => f.name.toLowerCase().includes(featureSearch.toLowerCase()))
                .map(f => {
                  const selected = selectedFeatures.includes(f.name);
                  return (
                    <button type="button" key={f.id} onClick={() => toggleFeature(f.name)}
                      className={`rounded-lg border px-3 py-2 text-xs transition ${selected ? "border-red-500 bg-red-500/10 text-red-200" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {selected ? "✓ " : ""}{f.name}
                    </button>
                  );
                })}
            </div>
            {selectedFeatures.length > 0 && <p className="mt-3 text-xs text-slate-500">Выбрано: {selectedFeatures.length}</p>}
          </fieldset>

          {conditions.length > 0 && (
            <fieldset className="rounded-xl border border-slate-800 p-4">
              <legend className="px-1 text-xs font-medium text-slate-400">Условия аренды</legend>
              <p className="mt-1 text-xs text-slate-500">Отметьте условие — оно появится на странице авто.</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {conditions.map(c => {
                  const selected = selectedConditions.find(s => s.conditionId === c.id);
                  return (
                    <div key={c.id} className={`rounded-lg border p-3 transition ${selected ? "border-red-500/50 bg-red-500/5" : "border-slate-800"}`}>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={Boolean(selected)} onChange={() => toggleCondition(c.id)} className="h-4 w-4 accent-red-600" />
                        <span className="text-sm text-white">{c.name}</span>
                      </label>
                      {selected && (
                        <input value={selected.value} onChange={e => setConditionValue(c.id, e.target.value)}
                          placeholder={c.placeholder ?? "Значение"}
                          className={`${field} mt-2 w-full`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>
          )}
        </>
      )}
    </div>
  );
}

function PriceInput({ label, value, onChange, usdRate }: { label: string; value: string; onChange: (v: string) => void; usdRate: number | null }) {
  const usd = usdRate && Number(value) > 0 ? Math.round(Number(value) / usdRate) : null;
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="relative">
        <input type="number" value={value} onChange={e => onChange(e.target.value)}
          className={`${field} w-full pr-10`} />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">BYN</span>
      </div>
      {usd != null && <span className="text-[10px] text-slate-500">≈ ${usd.toLocaleString("ru-RU")}</span>}
    </label>
  );
}
