"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBreadcrumbs from "@/shared/ui/page-breadcrumbs";
import {
  FUEL_GROUPS,
  FUEL_LABEL,
  FUEL_OPTIONS,
  TRANSMISSION_LABEL,
  TRANSMISSION_OPTIONS,
} from "@/shared/lib/car-dictionaries";

export interface RentCarItem {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
  class?: string;
  year?: number;
  color?: string;
  transmission?: string;
  fuel?: string;
  engineVolume?: string;
  seats?: number;
  features?: string;
  photos?: string;
  mainPhoto?: string;
  description?: string;
  priceDay?: number;
  price7Days?: number;
  priceDayTaxi?: number;
  rentType?: { id: string; name: string; slug: string };
  isActive: boolean;
  bookedUntil?: string;
  sortOrder: number;
}

export interface RentTypeItem { id: string; name: string; slug: string; }
export interface RentClassItem { id: string; name: string; slug: string; }
export interface RentComfortItem { id: string; name: string; slug: string; }
export interface RentDictionaryItem { id: string; name: string; slug: string; }

export interface RentFilters {
  type: string;
  class: string;
  priceFrom: string;
  priceTo: string;
  transmission: string;
  fuel: string;
  seats: string;
  features: string[];
  sort: string;
  view: "grid" | "list";
}

export const DEFAULT_RENT_FILTERS: RentFilters = {
  type: "",
  class: "",
  priceFrom: "",
  priceTo: "",
  transmission: "",
  fuel: "",
  seats: "",
  features: [],
  sort: "recommended",
  view: "grid",
};

const FALLBACK_PHOTO = "/images/placeholder-car.webp";

function photoList(car: RentCarItem): string[] {
  const csv = (car.photos ?? "").split(",").map(item => item.trim()).filter(Boolean);
  if (car.mainPhoto) {
    const rest = csv.filter(item => item !== car.mainPhoto);
    return [car.mainPhoto, ...rest];
  }
  return csv.length > 0 ? csv : [FALLBACK_PHOTO];
}

function featureList(car: RentCarItem): string[] {
  return (car.features ?? "").split(",").map(item => item.trim()).filter(Boolean);
}

function perDayPrice(car: RentCarItem): number {
  if (car.rentType?.slug === "taxi") {
    return car.priceDayTaxi ?? (car.price7Days != null ? Math.round(car.price7Days / 7) : 0);
  }
  return car.priceDay ?? 0;
}

function priceText(car: RentCarItem, usdRate: number): { primary: string; secondary: string; period: string } {
  const isTaxi = car.rentType?.slug === "taxi";
  if (isTaxi) {
    const byn = car.price7Days ?? 0;
    const usd = usdRate > 0 ? Math.round(byn / usdRate) : null;
    return {
      primary: byn ? `${byn.toLocaleString("ru-RU")} BYN` : "по запросу",
      secondary: usd ? `≈ $${usd.toLocaleString("ru-RU")}` : "",
      period: "за неделю",
    };
  }
  const byn = car.priceDay ?? 0;
  const usd = usdRate > 0 && byn ? Math.round(byn / usdRate) : null;
  return {
    primary: byn ? `${byn.toLocaleString("ru-RU")} BYN` : "по запросу",
    secondary: usd ? `≈ $${usd.toLocaleString("ru-RU")}` : "",
    period: "за сутки",
  };
}

function filterCars(cars: RentCarItem[], filters: RentFilters): RentCarItem[] {
  const from = filters.priceFrom ? Number(filters.priceFrom) : undefined;
  const to = filters.priceTo ? Number(filters.priceTo) : undefined;
  const seats = filters.seats ? Number(filters.seats) : undefined;

  return cars
    .filter(car => {
      if (filters.class && car.class !== filters.class) return false;
      if (filters.transmission && car.transmission !== filters.transmission) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (seats && (car.seats ?? 0) < seats) return false;
      const price = perDayPrice(car);
      if (from != null && price < from) return false;
      if (to != null && price > to) return false;
      const carFeatures = featureList(car);
      if (filters.features.some(feature => !carFeatures.includes(feature))) return false;
      return true;
    })
    .filter(car => !filters.type || car.rentType?.slug === filters.type)
    .sort((a, b) => {
      switch (filters.sort) {
        case "price_asc": return perDayPrice(a) - perDayPrice(b);
        case "price_desc": return perDayPrice(b) - perDayPrice(a);
        case "year_desc": return (b.year ?? 0) - (a.year ?? 0);
        default: return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
    });
}

function filtersToQuery(filters: RentFilters): string {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.class) params.set("class", filters.class);
  if (filters.priceFrom) params.set("priceFrom", filters.priceFrom);
  if (filters.priceTo) params.set("priceTo", filters.priceTo);
  if (filters.transmission) params.set("transmission", filters.transmission);
  if (filters.fuel) params.set("fuel", filters.fuel);
  if (filters.seats) params.set("seats", filters.seats);
  if (filters.features.length) params.set("features", filters.features.join(","));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.view !== "grid") params.set("view", filters.view);
  return params.toString();
}

export default function RentCatalog({
  cars,
  types,
  classes,
  comfortFeatures,
  transmissions,
  fuels,
  discountFrom,
  usdRate,
  initialFilters,
}: {
  cars: RentCarItem[];
  types: RentTypeItem[];
  classes: RentClassItem[];
  comfortFeatures: RentComfortItem[];
  transmissions: RentDictionaryItem[];
  fuels: RentDictionaryItem[];
  discountFrom: number | null;
  usdRate: number;
  initialFilters: RentFilters;
}) {
  const [filters, setFilters] = useState<RentFilters>(initialFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showComfort, setShowComfort] = useState(false);

  const baseCars = useMemo(() => filterCars(cars, { ...filters, type: "" }), [cars, filters]);
  const filtered = useMemo(() => filterCars(cars, filters), [cars, filters]);
  const activeCount = [
    filters.type, filters.class, filters.priceFrom, filters.priceTo,
    filters.transmission, filters.fuel, filters.seats, ...filters.features,
  ].filter(Boolean).length;

  const transmissionOptions = useMemo(() => {
    const labels = new Map(transmissions.map(item => [item.slug, item.name]));
    const base = TRANSMISSION_OPTIONS.map(item => item.value);
    const extras = [...new Set(cars.map(car => car.transmission).filter((value): value is string => Boolean(value)))]
      .filter(value => !base.includes(value as typeof base[number]));
    return [...base, ...extras].map(value => ({
      value,
      label: TRANSMISSION_LABEL[value] ?? labels.get(value) ?? value,
      count: cars.filter(car => car.transmission === value).length,
    }));
  }, [cars, transmissions]);

  const fuelGroups = useMemo(() => {
    const labels = new Map(fuels.map(item => [item.slug, item.name]));
    const groups: Array<{ label: string; options: Array<{ value: string; label: string; count: number }> }> = FUEL_GROUPS.map(group => ({
      label: group.label,
      options: group.values.map(value => ({
        value,
        label: FUEL_LABEL[value] ?? labels.get(value) ?? value,
        count: cars.filter(car => car.fuel === value).length,
      })),
    }));
    const known = new Set<string>(FUEL_OPTIONS);
    const extras = [...new Set(cars.map(car => car.fuel).filter((value): value is string => Boolean(value)))]
      .filter(value => !known.has(value));
    if (extras.length > 0) {
      groups.push({
        label: "Другое",
        options: extras.map(value => ({
          value,
          label: FUEL_LABEL[value] ?? labels.get(value) ?? value,
          count: cars.filter(car => car.fuel === value).length,
        })),
      });
    }
    return groups;
  }, [cars, fuels]);

  const classOptions = useMemo(
    () => classes.map(item => ({
      ...item,
      count: cars.filter(car => car.class === item.name).length,
    })),
    [classes, cars],
  );

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  function update(patch: Partial<RentFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    if (typeof window !== "undefined") {
      const query = filtersToQuery(next);
      window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
    }
  }

  function reset() {
    const next = { ...DEFAULT_RENT_FILTERS, view: filters.view, sort: filters.sort };
    setFilters(next);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  function toggleFeature(feature: string) {
    update({
      features: filters.features.includes(feature)
        ? filters.features.filter(item => item !== feature)
        : [...filters.features, feature],
    });
  }

  const filterPanel = (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Класс автомобиля</span>
          <select value={filters.class} onChange={event => update({ class: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
            <option value="">Все классы</option>
            {classOptions.map(item => <option key={item.id} value={item.name}>{item.name} · {item.count}</option>)}
          </select>
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Цена за сутки, BYN</span>
          <div className="flex items-center gap-2">
            <input value={filters.priceFrom} onChange={event => update({ priceFrom: event.target.value })} inputMode="numeric" placeholder="от" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
            <span className="text-zinc-600">—</span>
            <input value={filters.priceTo} onChange={event => update({ priceTo: event.target.value })} inputMode="numeric" placeholder="до" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
          </div>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Коробка</span>
          <select value={filters.transmission} onChange={event => update({ transmission: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
            <option value="">Любая</option>
            {transmissionOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} · {option.count}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-zinc-400">Топливо</span>
          <select value={filters.fuel} onChange={event => update({ fuel: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
            <option value="">Любое</option>
            {fuelGroups.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} · {option.count}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <p className="-mt-1 text-[11px] leading-relaxed text-zinc-500">
        Показаны все коробки и виды топлива. Цифра — количество авто в парке; 0 означает, что сейчас нет в наличии, но заявку можно оставить.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Мест не менее
          <select value={filters.seats} onChange={event => update({ seats: event.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-950/70 px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500">
            <option value="">любое</option>
            {[2, 4, 5, 7, 8].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => setShowComfort(value => !value)} className="text-xs font-medium text-zinc-400 transition hover:text-white">
          {showComfort ? "Скрыть комфорт" : "Комфорт и опции"}
        </button>
        <button type="button" onClick={reset} className="ml-auto text-xs text-red-400 hover:text-red-300">Сбросить всё</button>
      </div>
      {showComfort && (
        <div className="grid gap-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {comfortFeatures.map(feature => (
            <label key={feature.id} className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400 hover:text-white">
              <input type="checkbox" checked={filters.features.includes(feature.name)} onChange={() => toggleFeature(feature.name)} className="h-4 w-4 accent-red-600" />
              {feature.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PageBreadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/services" },
            { label: "Аренда" },
          ]}
        />

        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-red-600/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="relative max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {cars.length} авто в парке · доставка по Минску
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Аренда авто в Минске <span className="text-red-400">без сюрпризов</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Чистые автомобили, прозрачные цены и понятные условия. От эконома до бизнес-класса — подберите машину под задачу и сразу рассчитайте стоимость.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href="#fleet" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">Подобрать авто ↓</a>
              <Link href="/services/rent/calculator" className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white">Рассчитать аренду</Link>
            </div>
          </div>
        </div>

        <div id="fleet" className="mt-8 scroll-mt-24">
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => update({ type: "" })} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filters.type === "" ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"}`}>
              Все авто <span className={filters.type === "" ? "text-white/70" : "text-zinc-500"}>({baseCars.length})</span>
            </button>
            {types.map(type => (
              <button type="button" key={type.id} onClick={() => update({ type: filters.type === type.slug ? "" : type.slug })} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filters.type === type.slug ? "bg-red-600 text-white" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"}`}>
                {type.name} <span className={filters.type === type.slug ? "text-white/70" : "text-zinc-500"}>({baseCars.filter(car => car.rentType?.slug === type.slug).length})</span>
              </button>
            ))}
          </div>

          <div className="mb-5 hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-6 lg:block">{filterPanel}</div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white lg:hidden">
                Фильтры{activeCount > 0 ? ` (${activeCount})` : ""}
              </button>
              <span className="text-sm text-zinc-400">Найдено: <strong className="text-white">{filtered.length}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <select value={filters.sort} onChange={event => update({ sort: event.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-red-500">
                <option value="recommended">По умолчанию</option>
                <option value="price_asc">Сначала дешевле</option>
                <option value="price_desc">Сначала дороже</option>
                <option value="year_desc">Новее год</option>
              </select>
              <div className="hidden rounded-lg border border-zinc-700 bg-zinc-900 p-0.5 sm:flex">
                <button type="button" onClick={() => update({ view: "grid" })} className={`rounded-md px-2.5 py-1.5 text-xs ${filters.view === "grid" ? "bg-zinc-700 text-white" : "text-zinc-500"}`} aria-label="Сетка">▦</button>
                <button type="button" onClick={() => update({ view: "list" })} className={`rounded-md px-2.5 py-1.5 text-xs ${filters.view === "list" ? "bg-zinc-700 text-white" : "text-zinc-500"}`} aria-label="Список">☰</button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 py-20 text-center">
              <p className="text-lg font-medium text-white">Под ваши фильтры пока нет авто</p>
              <p className="mt-2 text-sm text-zinc-500">Сбросьте часть параметров — в парке есть разные классы.</p>
              <button type="button" onClick={reset} className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Сбросить фильтры</button>
            </div>
          ) : (
            <div className={filters.view === "list" ? "grid gap-4" : "grid gap-5 md:grid-cols-2 lg:grid-cols-3"}>
              {filtered.map(car => <RentCard key={car.id} car={car} usdRate={usdRate} discountFrom={discountFrom} view={filters.view} />)}
            </div>
          )}
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            ["Прозрачная цена", "В карточке — стоимость за сутки и неделю, без скрытых доплат."],
            ["Чистые авто", "Мойка и базовая проверка перед каждой выдачей."],
            ["Поможем с документами", "Подскажем по страховке, залогу и условиям аренды."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{text}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/30 to-zinc-900/50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Нужна помощь с выбором?</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Рассчитаем аренду под вашу задачу</h2>
            <p className="mt-1 text-sm text-zinc-400">Даты, город, дополнительные опции — покажем итоговую стоимость сразу.</p>
          </div>
          <Link href="/services/rent/calculator" className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700">Открыть калькулятор</Link>
        </section>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[75] bg-black/70 lg:hidden">
          <button className="absolute inset-0" onClick={() => setMobileOpen(false)} aria-label="Закрыть фильтры" />
          <div className="absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-zinc-700 bg-zinc-900 p-5 pb-24">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Фильтры</h2>
              <button type="button" onClick={() => setMobileOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400">×</button>
            </div>
            {filterPanel}
            <div className="fixed inset-x-0 bottom-0 border-t border-zinc-800 bg-zinc-900 p-4">
              <div className="mx-auto flex max-w-7xl gap-2">
                <button type="button" onClick={reset} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300">Сбросить</button>
                <button type="button" onClick={() => setMobileOpen(false)} className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white">Показать {filtered.length} авто</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RentCard({ car, usdRate, discountFrom, view }: { car: RentCarItem; usdRate: number; discountFrom: number | null; view: "grid" | "list" }) {
  const photos = photoList(car);
  const [photoIndex, setPhotoIndex] = useState(0);
  const safeIndex = Math.min(photoIndex, photos.length - 1);
  const price = priceText(car, usdRate);
  const features = featureList(car);
  const isTaxi = car.rentType?.slug === "taxi";
  const isBooked = Boolean(car.bookedUntil && new Date(car.bookedUntil) > new Date());
  const isList = view === "list";

  return (
    <Link href={`/services/rent/${car.slug}`} className={`group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-600 hover:bg-zinc-900 ${isList ? "flex flex-col sm:flex-row" : "flex flex-col"}`}>
      <div
        className={`relative shrink-0 overflow-hidden bg-zinc-800 ${isList ? "aspect-[16/10] sm:aspect-auto sm:min-h-[220px] sm:w-72" : "aspect-[16/10]"}`}
        onMouseLeave={() => setPhotoIndex(0)}
        onMouseMove={event => {
          if (photos.length < 2) return;
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          setPhotoIndex(Math.min(4, Math.max(0, Math.floor(ratio * 5))));
        }}
      >
        <Image src={photos[safeIndex] ?? FALLBACK_PHOTO} alt={car.name} fill sizes={isList ? "(max-width: 640px) 100vw, 288px" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"} className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {car.rentType && <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">{car.rentType.name}</span>}
          {car.class && <span className="rounded-full border border-sky-400/25 bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold text-sky-200 backdrop-blur-sm">{car.class}</span>}
          {isBooked && <span className="rounded-full border border-amber-400/30 bg-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-200 backdrop-blur-sm">Бронь до {new Date(car.bookedUntil!).toLocaleDateString("ru-RU")}</span>}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] text-white/85">
          <span className="rounded-full bg-black/45 px-2 py-1 backdrop-blur-sm">📷 {photos.length}</span>
          {photos.length > 5 && <span className="rounded-full bg-black/55 px-2 py-1 backdrop-blur-sm">+ ещё {photos.length - 5}</span>}
        </div>
        {photos.length > 1 && <div className="absolute inset-x-3 bottom-9 flex gap-1">{photos.slice(0, 5).map((_, index) => <span key={index} className={`h-0.5 flex-1 rounded-full ${index === safeIndex ? "bg-white" : "bg-white/25"}`} />)}</div>}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white transition group-hover:text-red-400 sm:text-lg">{car.name}</h3>
            <p className="mt-1 text-xs text-zinc-500">{car.year} · {TRANSMISSION_LABEL[car.transmission ?? ""] ?? car.transmission} · {FUEL_LABEL[car.fuel ?? ""] ?? car.fuel}{car.seats ? ` · ${car.seats} мест` : ""}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-white sm:text-xl">от {price.primary}</p>
            <p className="text-[10px] text-zinc-500">{price.period} {price.secondary && `· ${price.secondary}`}</p>
          </div>
        </div>

        {car.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">{car.description}</p>}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {features.slice(0, 4).map(feature => <span key={feature} className="rounded-md bg-zinc-800/80 px-2 py-1 text-[10px] text-zinc-400">{feature}</span>)}
          {features.length > 4 && <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-[10px] text-zinc-500">+{features.length - 4}</span>}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="text-zinc-500">{discountFrom && !isTaxi ? `Скидки от ${discountFrom} суток` : isTaxi ? "Аренда от недели" : "Доставка по Минску"}</span>
          <span className="font-medium text-red-400 transition group-hover:translate-x-0.5">Подробнее →</span>
        </div>
      </div>
    </Link>
  );
}
