"use client";

import { useEffect, useMemo, useState } from "react";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import PageBreadcrumbs from "@/shared/ui/page-breadcrumbs";
import EmptyState from "@/shared/ui/empty-state";
import { IconCar, IconCheckCircle } from "@/shared/ui/icons";
import {
  BODY_TYPE_LABEL,
  DRIVE_TYPE_LABEL,
  FUEL_LABEL,
  SALE_SORT_LABEL,
  TRANSMISSION_LABEL,
} from "@/shared/lib/car-dictionaries";
import SaleCard from "./sale-card";
import SaleRequestForm from "./sale-request-form";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  filterCars,
  filtersToQuery,
  type SellFilters,
} from "../lib/filters";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1994 }, (_, index) => CURRENT_YEAR - index);

export default function SellCatalog({
  cars,
  usdRate,
  initialFilters,
}: {
  cars: SaleCar[];
  usdRate: number;
  initialFilters: SellFilters;
}) {
  const [filters, setFilters] = useState<SellFilters>(initialFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filtered = useMemo(() => filterCars(cars, filters, usdRate), [cars, filters, usdRate]);
  const activeCount = countActiveFilters(filters);

  const brands = useMemo(() => {
    const map = new Map<string, { slug: string; name: string; count: number }>();
    for (const car of cars) {
      if (!car.brandSlug) continue;
      const current = map.get(car.brandSlug);
      if (current) current.count++;
      else map.set(car.brandSlug, { slug: car.brandSlug, name: car.brand ?? car.brandSlug, count: 1 });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [cars]);

  const models = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>();
    for (const car of cars) {
      if (!car.modelSlug) continue;
      if (filters.brand && car.brandSlug !== filters.brand) continue;
      if (!map.has(car.modelSlug)) map.set(car.modelSlug, { slug: car.modelSlug, name: car.model ?? car.modelSlug });
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [cars, filters.brand]);

  const generations = useMemo(() => {
    const set = new Set<string>();
    for (const car of cars) {
      if (filters.brand && car.brandSlug !== filters.brand) continue;
      if (filters.model && car.modelSlug !== filters.model) continue;
      if (car.generation) set.add(car.generation);
    }
    return [...set].sort();
  }, [cars, filters.brand, filters.model]);

  const bodyTypes = useMemo(() => {
    const set = new Set(cars.map(car => car.bodyType));
    return [...set];
  }, [cars]);

  const fuels = useMemo(() => {
    const set = new Set(cars.map(car => car.fuel));
    return [...set];
  }, [cars]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  function syncUrl(next: SellFilters) {
    if (typeof window === "undefined") return;
    const query = filtersToQuery(next);
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }

  function update(patch: Partial<SellFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    syncUrl(next);
  }

  function reset() {
    const next = { ...DEFAULT_FILTERS, sort: filters.sort, view: filters.view };
    setFilters(next);
    syncUrl(next);
  }

  function toggleBody(value: string) {
    update({
      bodyTypes: filters.bodyTypes.includes(value)
        ? filters.bodyTypes.filter(item => item !== value)
        : [...filters.bodyTypes, value],
    });
  }

  const activeChips: Array<{ label: string; onRemove: () => void }> = [];
  if (filters.q) activeChips.push({ label: `«${filters.q}»`, onRemove: () => update({ q: "" }) });
  if (filters.brand) {
    const brand = brands.find(item => item.slug === filters.brand);
    activeChips.push({ label: brand?.name ?? filters.brand, onRemove: () => update({ brand: "", model: "", generation: "" }) });
  }
  if (filters.model) {
    const model = models.find(item => item.slug === filters.model);
    activeChips.push({ label: model?.name ?? filters.model, onRemove: () => update({ model: "", generation: "" }) });
  }
  if (filters.generation) activeChips.push({ label: filters.generation, onRemove: () => update({ generation: "" }) });
  if (filters.priceMin || filters.priceMax) {
    activeChips.push({
      label: `${filters.currency === "USD" ? "$" : ""}${filters.priceMin || "0"} — ${filters.currency === "USD" ? "$" : ""}${filters.priceMax || "∞"}${filters.currency === "BYN" ? " р." : ""}`,
      onRemove: () => update({ priceMin: "", priceMax: "" }),
    });
  }
  if (filters.yearMin || filters.yearMax) {
    activeChips.push({ label: `${filters.yearMin || "1995"} — ${filters.yearMax || CURRENT_YEAR} г.`, onRemove: () => update({ yearMin: "", yearMax: "" }) });
  }
  if (filters.transmission) {
    activeChips.push({
      label: filters.transmission === "automatic" ? "Автомат" : TRANSMISSION_LABEL[filters.transmission] ?? filters.transmission,
      onRemove: () => update({ transmission: "" }),
    });
  }
  if (filters.fuel) {
    activeChips.push({ label: FUEL_LABEL[filters.fuel] ?? filters.fuel, onRemove: () => update({ fuel: "" }) });
  }
  if (filters.engineMin || filters.engineMax) {
    activeChips.push({ label: `${filters.engineMin || "0"}–${filters.engineMax || "6"} л`, onRemove: () => update({ engineMin: "", engineMax: "" }) });
  }
  for (const body of filters.bodyTypes) {
    activeChips.push({ label: BODY_TYPE_LABEL[body] ?? body, onRemove: () => toggleBody(body) });
  }
  if (filters.drive) {
    activeChips.push({ label: DRIVE_TYPE_LABEL[filters.drive] ?? filters.drive, onRemove: () => update({ drive: "" }) });
  }
  if (filters.mileageMax) {
    activeChips.push({ label: `до ${Number(filters.mileageMax).toLocaleString("ru-RU")} км`, onRemove: () => update({ mileageMax: "" }) });
  }
  if (filters.inspected) activeChips.push({ label: "Проверено АВТОWAY", onRemove: () => update({ inspected: false }) });
  if (filters.originalPaint) activeChips.push({ label: "В родной краске", onRemove: () => update({ originalPaint: false }) });
  if (filters.noAccidents) activeChips.push({ label: "Без ДТП", onRemove: () => update({ noAccidents: false }) });
  if (filters.allowExchange) activeChips.push({ label: "Trade-in", onRemove: () => update({ allowExchange: false }) });
  if (!filters.hideSold) activeChips.push({ label: "Показывать проданные", onRemove: () => update({ hideSold: true }) });

  function renderFilters(mobile = false) {
    return (
      <div className={mobile ? "space-y-5" : "space-y-4"}>
        <input
          value={filters.q}
          onChange={event => update({ q: event.target.value })}
          placeholder="Поиск по названию, марке или VIN..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Марка</span>
            <select
              value={filters.brand}
              onChange={event => update({ brand: event.target.value, model: "", generation: "" })}
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
            >
              <option value="">Все марки</option>
              {brands.map(brand => <option key={brand.slug} value={brand.slug}>{brand.name} ({brand.count})</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Модель</span>
            <select
              value={filters.model}
              onChange={event => update({ model: event.target.value, generation: "" })}
              disabled={!filters.brand}
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Все модели</option>
              {models.map(model => <option key={model.slug} value={model.slug}>{model.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Поколение / кузов</span>
            <select
              value={filters.generation}
              onChange={event => update({ generation: event.target.value })}
              className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
            >
              <option value="">Любое</option>
              {generations.map(generation => <option key={generation} value={generation}>{generation}</option>)}
            </select>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center justify-between text-xs font-medium text-zinc-400">
              Цена
              <span className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950/70 p-0.5 text-[10px]">
                <button type="button" onClick={() => update({ currency: "USD" })} className={`rounded-md px-2 py-1 ${filters.currency === "USD" ? "bg-zinc-700 text-white" : "text-zinc-500"}`}>USD $</button>
                <button type="button" onClick={() => update({ currency: "BYN" })} className={`rounded-md px-2 py-1 ${filters.currency === "BYN" ? "bg-zinc-700 text-white" : "text-zinc-500"}`}>BYN р.</button>
              </span>
            </span>
            <div className="flex items-center gap-2">
              <input value={filters.priceMin} onChange={event => update({ priceMin: event.target.value })} inputMode="numeric" placeholder="от" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
              <span className="text-zinc-600">—</span>
              <input value={filters.priceMax} onChange={event => update({ priceMax: event.target.value })} inputMode="numeric" placeholder="до" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Год выпуска</span>
            <div className="flex items-center gap-2">
              <select value={filters.yearMin} onChange={event => update({ yearMin: event.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-2.5 py-2.5 text-sm text-white outline-none focus:border-red-500">
                <option value="">от</option>
                {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
              <span className="text-zinc-600">—</span>
              <select value={filters.yearMax} onChange={event => update({ yearMax: event.target.value })} className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-2.5 py-2.5 text-sm text-white outline-none focus:border-red-500">
                <option value="">до</option>
                {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Коробка</span>
            <select value={filters.transmission} onChange={event => update({ transmission: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
              <option value="">Любая</option>
              <option value="automatic">Автомат (все)</option>
              {Object.entries(TRANSMISSION_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Топливо</span>
            <select value={filters.fuel} onChange={event => update({ fuel: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
              <option value="">Любое</option>
              {fuels.map(fuel => <option key={fuel} value={fuel}>{FUEL_LABEL[fuel] ?? fuel}</option>)}
            </select>
          </label>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Объём, л</span>
            <div className="flex items-center gap-2">
              <input value={filters.engineMin} onChange={event => update({ engineMin: event.target.value })} inputMode="decimal" placeholder="от" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
              <span className="text-zinc-600">—</span>
              <input value={filters.engineMax} onChange={event => update({ engineMax: event.target.value })} inputMode="decimal" placeholder="до" className="w-full rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
            </div>
          </div>
        </div>

        <button type="button" onClick={() => setShowAdvanced(value => !value)} className="flex items-center gap-2 text-xs font-medium text-zinc-400 transition hover:text-white">
          <span className={`transition ${showAdvanced ? "rotate-90" : ""}`}>›</span>
          {showAdvanced ? "Скрыть параметры" : "Расширенный фильтр"}
        </button>

        {showAdvanced && (
          <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5">
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-400">Кузов</p>
              <div className="flex flex-wrap gap-2">
                {bodyTypes.map(body => {
                  const active = filters.bodyTypes.includes(body);
                  return (
                    <button type="button" key={body} onClick={() => toggleBody(body)} className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-red-500/60 bg-red-500/15 text-red-300" : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"}`}>
                      {BODY_TYPE_LABEL[body] ?? body}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Привод</span>
                <select value={filters.drive} onChange={event => update({ drive: event.target.value })} className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500">
                  <option value="">Любой</option>
                  {Object.entries(DRIVE_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-400">Пробег до, км</span>
                <input value={filters.mileageMax} onChange={event => update({ mileageMax: event.target.value })} inputMode="numeric" placeholder="например, 100000" className="rounded-xl border border-zinc-700 bg-zinc-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500" />
              </label>
              <div className="flex flex-col justify-end gap-2 text-xs text-zinc-400 sm:col-span-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={filters.inspected} onChange={event => update({ inspected: event.target.checked })} className="h-4 w-4 accent-red-600" /> Проверено АВТОWAY</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={filters.originalPaint} onChange={event => update({ originalPaint: event.target.checked })} className="h-4 w-4 accent-red-600" /> В родной краске</label>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-400">
              <label className="flex items-center gap-2"><input type="checkbox" checked={filters.noAccidents} onChange={event => update({ noAccidents: event.target.checked })} className="h-4 w-4 accent-red-600" /> Без ДТП</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={filters.allowExchange} onChange={event => update({ allowExchange: event.target.checked })} className="h-4 w-4 accent-red-600" /> Возможен обмен / Trade-in</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={filters.hideSold} onChange={event => update({ hideSold: event.target.checked })} className="h-4 w-4 accent-red-600" /> Скрыть проданные</label>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <PageBreadcrumbs
          className="mb-6"
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/services" },
            { label: "Продажа авто" },
          ]}
        />

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {cars.length > 0
                ? `${cars.filter(car => car.status !== "sold").length} авто в наличии`
                : "Витрина обновляется"}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Автомобили в продаже с проверкой АВТОWAY
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Каждый автомобиль прошёл комплексную диагностику кузова, технической части и юридической чистоты.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {cars.length > 0 ? (
              <>
                <a href="#catalog" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">Подобрать авто в каталоге ↓</a>
                <a href="#sell-own" className="rounded-xl border border-zinc-700 bg-zinc-900/60 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white">Продать свой автомобиль</a>
              </>
            ) : (
              <a href="#sell-own" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700">Продать свой автомобиль</a>
            )}
          </div>
        </div>

        {cars.length === 0 ? (
          <EmptyState
            accent="emerald"
            icon={<IconCar className="h-8 w-8" />}
            badge="Витрина обновляется"
            title="Сейчас в продаже нет автомобилей"
            description="Мы готовим новые проверенные автомобили. Расскажите, что ищете — подберём вариант под ваш бюджет или поможем продать вашу машину."
            actions={[
              { label: "Подобрать авто", href: "/contacts" },
              { label: "Продать свой автомобиль", href: "#sell-own" },
            ]}
            features={[
              {
                title: "Проверка перед продажей",
                text: "Диагностика кузова, техники и документов.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Поможем с выбором",
                text: "Сориентируем по бюджету, модели и состоянию.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Сопровождение сделки",
                text: "Проверим документы и поможем с оформлением.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
            ]}
          />
        ) : (
        <div id="catalog" className="scroll-mt-24">
          <div className="mb-3 flex items-center justify-between gap-3 lg:hidden">
            <button type="button" onClick={() => setMobileOpen(true)} className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white">
              Фильтры{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
            <span className="text-xs text-zinc-500">Найдено: {filtered.length}</span>
          </div>

          <div className="mb-5 hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 sm:p-6 lg:block">
            {renderFilters()}
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-zinc-400">Найдено: <strong className="text-white">{filtered.length}</strong></span>
              {activeChips.map(chip => (
                <button type="button" key={chip.label} onClick={chip.onRemove} className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-zinc-500">
                  {chip.label} <span className="text-zinc-500">×</span>
                </button>
              ))}
              {activeChips.length > 0 && <button type="button" onClick={reset} className="text-[11px] text-red-400 hover:text-red-300">Сбросить всё</button>}
            </div>
            <div className="flex items-center gap-2">
              <select value={filters.sort} onChange={event => update({ sort: event.target.value })} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2.5 py-2 text-xs text-zinc-300 outline-none focus:border-red-500">
                {Object.entries(SALE_SORT_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <div className="hidden rounded-lg border border-zinc-700 bg-zinc-900 p-0.5 sm:flex">
                <button type="button" onClick={() => update({ view: "grid" })} className={`rounded-md px-2.5 py-1.5 text-xs ${filters.view === "grid" ? "bg-zinc-700 text-white" : "text-zinc-500"}`} aria-label="Сетка">▦</button>
                <button type="button" onClick={() => update({ view: "list" })} className={`rounded-md px-2.5 py-1.5 text-xs ${filters.view === "list" ? "bg-zinc-700 text-white" : "text-zinc-500"}`} aria-label="Список">☰</button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              compact
              accent="amber"
              icon={<IconCar className="h-7 w-7" />}
              badge="Нет совпадений"
              title="По вашим фильтрам ничего не найдено"
              description="Попробуйте убрать часть параметров или расширить диапазон цены."
              actions={[{ label: "Сбросить фильтры", onClick: reset }]}
            />
          ) : (
            <div className={filters.view === "list" ? "grid gap-4" : "grid gap-5 md:grid-cols-2 lg:grid-cols-3"}>
              {filtered.map(car => (
                <SaleCard key={car.id} car={car} usdRate={usdRate} currency={filters.currency} view={filters.view} />
              ))}
            </div>
          )}
        </div>
        )}

        <section id="sell-own" className="mt-20 scroll-mt-24">
          <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-red-950/30 via-zinc-900/70 to-zinc-950 p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Продажа через АВТОWAY</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Продадим ваш автомобиль быстро и дорого</h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Берём на себя подготовку, фото, рекламу, звонки, показы и оформление. Вы получаете деньги, а не головную боль.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    ["Комиссия под ключ", "Подготовка, 30+ фото, все площадки, показы и сделка."],
                    ["Помощь в продаже", "Вы продолжаете ездить, мы берём рекламу и переговоры."],
                    ["Срочный выкуп / Trade-in", "Честная оценка и расчёт в день обращения."],
                  ].map(([title, text]) => (
                    <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/80 p-5">
                <p className="mb-4 text-sm font-semibold text-white">Оценить моё авто</p>
                <SaleRequestForm type="sell_own" compact submitLabel="Оценить моё авто" />
              </div>
            </div>
          </div>
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
            {renderFilters(true)}
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
