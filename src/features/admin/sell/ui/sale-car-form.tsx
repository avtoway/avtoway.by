"use client";

import { useEffect, useState } from "react";
import type { CustomSpec } from "@/entities/sell/sale-car.types";
import { slugify } from "@/shared/lib/slug";
import {
  ALL_SALE_FEATURES,
  BODY_TYPE_LABEL,
  DRIVE_TYPE_LABEL,
  FUEL_LABEL,
  INTERIOR_COLOR_LABEL,
  INTERIOR_MATERIAL_LABEL,
  SALE_CONDITION_LABEL,
  SALE_FEATURE_GROUPS,
  SALE_STATUS_LABEL,
  TRANSMISSION_LABEL,
} from "@/shared/lib/car-dictionaries";
import PhotoManager from "@/shared/ui/admin/photo-manager";

export interface SaleCarFormState {
  title: string;
  slug: string;
  brandId: string;
  modelId: string;
  generation: string;
  priceUsd: string;
  priceByn: string;
  oldPriceUsd: string;
  isNegotiable: boolean;
  allowExchange: boolean;
  allowCredit: boolean;
  year: string;
  mileageKm: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  engineVolume: string;
  enginePowerHp: string;
  driveType: string;
  color: string;
  interiorMaterial: string;
  interiorColor: string;
  steering: string;
  seats: string;
  doors: string;
  condition: string;
  ownersCount: string;
  originCountry: string;
  customsCleared: boolean;
  vin: string;
  vinVerified: boolean;
  originalPaint: boolean;
  noAccidents: boolean;
  serviceBook: boolean;
  isInspected: boolean;
  expertSummary: string;
  bodyCheckNote: string;
  techCheckNote: string;
  legalCheckNote: string;
  diagnosticsPdf: string;
  features: string[];
  customSpecs: CustomSpec[];
  description: string;
  photos: string[];
  mainPhoto: string;
  videoUrl: string;
  city: string;
  contactName: string;
  contactPhone: string;
  status: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
}

export const EMPTY_SALE_FORM: SaleCarFormState = {
  title: "", slug: "", brandId: "", modelId: "", generation: "",
  priceUsd: "", priceByn: "", oldPriceUsd: "", isNegotiable: true, allowExchange: false, allowCredit: false,
  year: String(new Date().getFullYear()), mileageKm: "", bodyType: "sedan", transmission: "auto", fuel: "gasoline",
  engineVolume: "", enginePowerHp: "", driveType: "fwd", color: "", interiorMaterial: "", interiorColor: "",
  steering: "left", seats: "5", doors: "4", condition: "used", ownersCount: "", originCountry: "Беларусь",
  customsCleared: true, vin: "", vinVerified: false, originalPaint: false, noAccidents: false, serviceBook: false,
  isInspected: true, expertSummary: "", bodyCheckNote: "", techCheckNote: "", legalCheckNote: "", diagnosticsPdf: "",
  features: [], customSpecs: [], description: "", photos: [], mainPhoto: "", videoUrl: "",
  city: "Минск", contactName: "Виктор", contactPhone: "", status: "available", isFeatured: false, isActive: true,
  sortOrder: "0", seoTitle: "", seoDescription: "",
};

interface Brand { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[] }

const field = "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "flex flex-col gap-1 text-xs text-slate-400";

const CONDITION_CHECKBOXES: Array<[keyof SaleCarFormState, string]> = [
  ["isInspected", "Проверено АВТОWAY"],
  ["vinVerified", "VIN проверен"],
  ["originalPaint", "В родной краске"],
  ["noAccidents", "Без ДТП"],
  ["serviceBook", "Сервисная история"],
  ["customsCleared", "Растаможен"],
];

export default function SaleCarForm({
  form,
  onChange,
  usdRate,
}: {
  form: SaleCarFormState;
  onChange: (field: string, value: unknown) => void;
  usdRate: number;
}) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featureSearch, setFeatureSearch] = useState("");

  useEffect(() => {
    fetch("/api/cars").then(response => response.json()).then(json => {
      if (json.ok) setBrands(json.data);
    }).catch(() => undefined);
  }, []);

  const selectedBrand = brands.find(brand => brand.id === form.brandId);
  const models = selectedBrand?.models ?? [];
  const selectedFeatures = new Set(form.features);
  const priceBynHint = Number(form.priceUsd) > 0 ? Math.round(Number(form.priceUsd) * usdRate) : 0;

  function toggleFeature(feature: string) {
    const next = new Set(form.features);
    if (next.has(feature)) next.delete(feature);
    else next.add(feature);
    onChange("features", [...next]);
  }

  function updateSpec(index: number, key: keyof CustomSpec, value: string) {
    const next = form.customSpecs.map((spec, specIndex) => specIndex === index ? { ...spec, [key]: value } : spec);
    onChange("customSpecs", next);
  }

  function addSpec() {
    onChange("customSpecs", [...form.customSpecs, { label: "", value: "" }]);
  }

  function removeSpec(index: number) {
    onChange("customSpecs", form.customSpecs.filter((_, specIndex) => specIndex !== index));
  }

  function autoTitle() {
    const brand = selectedBrand?.name ?? "";
    const model = models.find(item => item.id === form.modelId)?.name ?? "";
    const title = [brand, model, form.generation, form.year].filter(Boolean).join(" ");
    if (title) {
      onChange("title", title);
      onChange("slug", slugify(title));
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-slate-800 p-4">
        <p className="mb-3 text-xs font-medium text-slate-400">Фотографии и видео</p>
        <PhotoManager
          category="sell"
          photos={form.photos}
          mainPhoto={form.mainPhoto}
          onChange={(photos, mainPhoto) => {
            onChange("photos", photos);
            onChange("mainPhoto", mainPhoto);
          }}
        />
        <label className={`${label} mt-3`}>
          <span>Ссылка на видеообзор (YouTube / Rutube)</span>
          <input value={form.videoUrl} onChange={event => onChange("videoUrl", event.target.value)} placeholder="https://youtube.com/watch?v=..." className={field} />
        </label>
      </div>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Основное и цена</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className={label}><span>Марка</span>
            <select value={form.brandId} onChange={event => { onChange("brandId", event.target.value); onChange("modelId", ""); }} className={field}>
              <option value="">Выберите марку</option>
              {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
            </select>
          </label>
          <label className={label}><span>Модель</span>
            <select value={form.modelId} onChange={event => onChange("modelId", event.target.value)} className={field}>
              <option value="">Выберите модель</option>
              {models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
            </select>
          </label>
          <label className={label}><span>Поколение / модификация</span>
            <input value={form.generation} onChange={event => onChange("generation", event.target.value)} placeholder="G30, XV70, B8" className={field} />
          </label>
          <label className={label}><span>Год выпуска *</span>
            <input type="number" value={form.year} onChange={event => onChange("year", event.target.value)} className={field} />
          </label>
          <label className={label}><span>Пробег, км *</span>
            <input type="number" value={form.mileageKm} onChange={event => onChange("mileageKm", event.target.value)} className={field} />
          </label>
          <label className={label}><span>Город осмотра</span>
            <input value={form.city} onChange={event => onChange("city", event.target.value)} className={field} />
          </label>
          <label className={`${label} sm:col-span-2`}><span>Название объявления *</span>
            <div className="flex gap-2">
              <input value={form.title} onChange={event => onChange("title", event.target.value)} className={`${field} flex-1`} />
              <button type="button" onClick={autoTitle} className="shrink-0 rounded-lg border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800">Сгенерировать</button>
            </div>
          </label>
          <label className={`${label} sm:col-span-2`}><span>Slug *</span>
            <div className="flex gap-2">
              <input value={form.slug} onChange={event => onChange("slug", event.target.value)} className={`${field} flex-1`} />
              <button type="button" onClick={() => onChange("slug", slugify(form.title))} className="shrink-0 rounded-lg border border-slate-700 px-3 text-xs text-slate-300 hover:bg-slate-800">Из названия</button>
            </div>
          </label>
          <label className={label}><span>Цена в USD *</span>
            <input type="number" value={form.priceUsd} onChange={event => onChange("priceUsd", event.target.value)} className={field} />
            {priceBynHint > 0 && <span className="text-[10px] text-slate-500">≈ {priceBynHint.toLocaleString("ru-RU")} BYN по курсу</span>}
          </label>
          <label className={label}><span>Фиксированная цена в BYN</span>
            <input type="number" value={form.priceByn} onChange={event => onChange("priceByn", event.target.value)} placeholder="Если пусто — по курсу" className={field} />
          </label>
          <label className={label}><span>Старая цена в USD</span>
            <input type="number" value={form.oldPriceUsd} onChange={event => onChange("oldPriceUsd", event.target.value)} className={field} />
          </label>
          <label className={label}><span>Статус</span>
            <select value={form.status} onChange={event => onChange("status", event.target.value)} className={field}>
              {Object.entries(SALE_STATUS_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 sm:col-span-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNegotiable} onChange={event => onChange("isNegotiable", event.target.checked)} className="accent-red-600" /> Возможен торг</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.allowExchange} onChange={event => onChange("allowExchange", event.target.checked)} className="accent-red-600" /> Обмен / Trade-in</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.allowCredit} onChange={event => onChange("allowCredit", event.target.checked)} className="accent-red-600" /> Кредит / лизинг</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={event => onChange("isFeatured", event.target.checked)} className="accent-red-600" /> Спецпредложение</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={event => onChange("isActive", event.target.checked)} className="accent-red-600" /> Опубликовано</label>
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Технические характеристики</legend>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={label}><span>Кузов</span>
            <select value={form.bodyType} onChange={event => onChange("bodyType", event.target.value)} className={field}>
              {Object.entries(BODY_TYPE_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Коробка</span>
            <select value={form.transmission} onChange={event => onChange("transmission", event.target.value)} className={field}>
              {Object.entries(TRANSMISSION_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Топливо</span>
            <select value={form.fuel} onChange={event => onChange("fuel", event.target.value)} className={field}>
              {Object.entries(FUEL_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Объём, л</span><input type="number" step="0.1" value={form.engineVolume} onChange={event => onChange("engineVolume", event.target.value)} className={field} /></label>
          <label className={label}><span>Мощность, л.с.</span><input type="number" value={form.enginePowerHp} onChange={event => onChange("enginePowerHp", event.target.value)} className={field} /></label>
          <label className={label}><span>Привод</span>
            <select value={form.driveType} onChange={event => onChange("driveType", event.target.value)} className={field}>
              {Object.entries(DRIVE_TYPE_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Цвет кузова</span><input value={form.color} onChange={event => onChange("color", event.target.value)} className={field} /></label>
          <label className={label}><span>Материал салона</span>
            <select value={form.interiorMaterial} onChange={event => onChange("interiorMaterial", event.target.value)} className={field}>
              <option value="">Не указан</option>
              {Object.entries(INTERIOR_MATERIAL_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Цвет салона</span>
            <select value={form.interiorColor} onChange={event => onChange("interiorColor", event.target.value)} className={field}>
              <option value="">Не указан</option>
              {Object.entries(INTERIOR_COLOR_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Руль</span>
            <select value={form.steering} onChange={event => onChange("steering", event.target.value)} className={field}>
              <option value="left">Левый</option><option value="right">Правый</option>
            </select>
          </label>
          <label className={label}><span>Мест</span><input type="number" value={form.seats} onChange={event => onChange("seats", event.target.value)} className={field} /></label>
          <label className={label}><span>Дверей</span><input type="number" value={form.doors} onChange={event => onChange("doors", event.target.value)} className={field} /></label>
          <label className={label}><span>Состояние</span>
            <select value={form.condition} onChange={event => onChange("condition", event.target.value)} className={field}>
              {Object.entries(SALE_CONDITION_LABEL).map(([value, labelText]) => <option key={value} value={value}>{labelText}</option>)}
            </select>
          </label>
          <label className={label}><span>Владельцев</span><input value={form.ownersCount} onChange={event => onChange("ownersCount", event.target.value)} placeholder="1, 2, 3+" className={field} /></label>
          <label className={label}><span>Страна происхождения</span><input value={form.originCountry} onChange={event => onChange("originCountry", event.target.value)} className={field} /></label>
          <label className={label}><span>VIN</span><input value={form.vin} onChange={event => onChange("vin", event.target.value)} className={field} /></label>
        </div>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400">Дополнительные характеристики</p>
            <button type="button" onClick={addSpec} className="text-xs text-red-400 hover:text-red-300">+ Добавить</button>
          </div>
          <div className="space-y-2">
            {form.customSpecs.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input value={spec.label} onChange={event => updateSpec(index, "label", event.target.value)} placeholder="Название" className={`${field} flex-1`} />
                <input value={spec.value} onChange={event => updateSpec(index, "value", event.target.value)} placeholder="Значение" className={`${field} flex-1`} />
                <button type="button" onClick={() => removeSpec(index)} className="rounded-lg px-2 text-red-400 hover:bg-red-950">×</button>
              </div>
            ))}
          </div>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Проверка АВТОWAY и история</legend>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-300">
          {CONDITION_CHECKBOXES.map(([key, text]) => (
            <label key={key} className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form[key])} onChange={event => onChange(key, event.target.checked)} className="accent-red-600" />
              {text}
            </label>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={`${label} sm:col-span-2`}><span>Короткий вердикт эксперта</span>
            <textarea rows={2} value={form.expertSummary} onChange={event => onChange("expertSummary", event.target.value)} className={field} />
          </label>
          <label className={label}><span>Кузов и ЛКП</span><textarea rows={3} value={form.bodyCheckNote} onChange={event => onChange("bodyCheckNote", event.target.value)} className={field} /></label>
          <label className={label}><span>Двигатель, КПП, подвеска</span><textarea rows={3} value={form.techCheckNote} onChange={event => onChange("techCheckNote", event.target.value)} className={field} /></label>
          <label className={label}><span>Юридическая чистота</span><textarea rows={3} value={form.legalCheckNote} onChange={event => onChange("legalCheckNote", event.target.value)} className={field} /></label>
          <label className={label}><span>Ссылка на диагностику</span><input value={form.diagnosticsPdf} onChange={event => onChange("diagnosticsPdf", event.target.value)} className={field} /></label>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-800 p-4">
        <legend className="px-1 text-xs font-medium text-slate-400">Комплектация и описание</legend>
        <input value={featureSearch} onChange={event => setFeatureSearch(event.target.value)} placeholder="Поиск по опциям..." className={`${field} mb-4 w-full`} />
        <div className="grid gap-4 sm:grid-cols-2">
          {SALE_FEATURE_GROUPS.map(group => {
            const items = group.items.filter(item => item.toLowerCase().includes(featureSearch.toLowerCase()));
            if (items.length === 0) return null;
            return (
              <div key={group.title} className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
                <p className="mb-2 text-xs font-medium text-slate-300">{group.title}</p>
                <div className="grid gap-1.5">
                  {items.map(feature => (
                    <label key={feature} className="flex items-start gap-2 text-xs text-slate-400">
                      <input type="checkbox" checked={selectedFeatures.has(feature)} onChange={() => toggleFeature(feature)} className="mt-0.5 accent-red-600" />
                      {feature}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <button type="button" onClick={() => onChange("features", [...new Set([...form.features, ...ALL_SALE_FEATURES.slice(0, 12)])])} className="mt-3 text-xs text-red-400 hover:text-red-300">Выбрать популярные</button>

        <label className={`${label} mt-4`}><span>Подробное описание</span>
          <textarea rows={6} value={form.description} onChange={event => onChange("description", event.target.value)} className={field} />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={label}><span>SEO Title</span><input value={form.seoTitle} onChange={event => onChange("seoTitle", event.target.value)} className={field} /></label>
          <label className={label}><span>SEO Description</span><input value={form.seoDescription} onChange={event => onChange("seoDescription", event.target.value)} className={field} /></label>
          <label className={label}><span>Контактное лицо</span><input value={form.contactName} onChange={event => onChange("contactName", event.target.value)} className={field} /></label>
          <label className={label}><span>Телефон</span><input value={form.contactPhone} onChange={event => onChange("contactPhone", event.target.value)} className={field} /></label>
          <label className={label}><span>Сортировка</span><input type="number" value={form.sortOrder} onChange={event => onChange("sortOrder", event.target.value)} className={field} /></label>
        </div>
      </fieldset>
    </div>
  );
}
