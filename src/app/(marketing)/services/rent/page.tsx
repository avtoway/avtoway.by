"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPriceLabel } from "@/shared/lib/price";
import { TRANSMISSION_LABEL, FUEL_LABEL } from "@/shared/lib/car-dictionaries";

interface RentType { id: string; name: string; slug: string; }
interface RentCar {
  id: string; name: string; slug: string; brand?: string; model?: string; class?: string;
  year?: number; color?: string; transmission?: string; fuel?: string;
  engineVolume?: string; seats?: number; features?: string;
  photos?: string; mainPhoto?: string; description?: string;
  priceDay?: number; price3Days?: number; price7Days?: number;
  priceMonth?: number; priceDayTaxi?: number;
  rentType?: { id: string; name: string; slug: string };
  isActive: boolean; bookedUntil?: string;
}

interface ComfortFeature { id: string; name: string; slug: string; }
interface ClassItem { id: string; name: string; slug: string; }

export default function RentPage() {
  const [cars, setCars] = useState<RentCar[]>([]);
  const [types, setTypes] = useState<RentType[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [seatsFilter, setSeatsFilter] = useState("");
  const [featureFilters, setFeatureFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [comfortFeatures, setComfortFeatures] = useState<ComfortFeature[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/rent").then(r => r.json()),
      fetch("/api/rent?types=true").then(r => r.json()),
      fetch("/api/rent/classes").then(r => r.json()),
      fetch("/api/exchange-rate").then(r => r.json()),
      fetch("/api/comfort-features").then(r => r.json()),
    ]).then(([cRes, tRes, clRes, eRes, fRes]) => {
      if (cRes.ok) setCars(cRes.data);
      if (tRes.ok) setTypes(tRes.data);
      if (clRes.ok) setClasses(clRes.data);
      if (eRes.ok) setUsdRate(eRes.rate);
      if (fRes.ok) setComfortFeatures(fRes.data);
      setLoading(false);
    });
  }, []);

  const filtered = cars.filter(c => {
    if (typeFilter && c.rentType?.slug !== typeFilter) return false;
    if (classFilter && c.class !== classFilter) return false;
    if (transmissionFilter && c.transmission !== transmissionFilter) return false;
    if (fuelFilter && c.fuel !== fuelFilter) return false;
    if (seatsFilter && (c.seats ?? 0) < parseInt(seatsFilter)) return false;
    if (priceFrom && (c.priceDay ?? 0) < parseInt(priceFrom)) return false;
    if (priceTo && (c.priceDay ?? 0) > parseInt(priceTo)) return false;
    if (featureFilters.size > 0) {
      const carFeatures = c.features?.split(",").map(f => f.trim()) ?? [];
      for (const f of featureFilters) if (!carFeatures.includes(f)) return false;
    }
    return true;
  });

  function toggleFeature(f: string) {
    setFeatureFilters(prev => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  }

  const filtersPanel = (
    <div className="space-y-5">
      <FilterSection label="Тип аренды">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Все</option>
          {types.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Класс">
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Все классы</option>
          {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Цена за день, BYN">
        <div className="flex gap-2">
          <input type="number" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} placeholder="от"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
          <input type="number" value={priceTo} onChange={e => setPriceTo(e.target.value)} placeholder="до"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        </div>
      </FilterSection>

      <FilterSection label="Коробка">
        <select value={transmissionFilter} onChange={e => setTransmissionFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Любая</option>
          {Object.entries(TRANSMISSION_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection label="Топливо">
        <select value={fuelFilter} onChange={e => setFuelFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Любое</option>
          {Object.entries(FUEL_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </FilterSection>

      <FilterSection label="Мест, не менее">
        <select value={seatsFilter} onChange={e => setSeatsFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Любое</option>
          {[2, 4, 5, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Комфорт">
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {comfortFeatures.map(f => (
            <label key={f.id} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <input type="checkbox" checked={featureFilters.has(f.name)} onChange={() => toggleFeature(f.name)}
                className="h-4 w-4 accent-red-600 rounded" />
              {f.name}
            </label>
          ))}
        </div>
      </FilterSection>

      <button onClick={() => { setTypeFilter(""); setClassFilter(""); setPriceFrom(""); setPriceTo(""); setTransmissionFilter(""); setFuelFilter(""); setSeatsFilter(""); setFeatureFilters(new Set()); }}
        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-white">
        Сбросить
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:text-white transition">Главная</Link>
          <span className="mx-1">/</span>
          <Link href="/services" className="hover:text-white transition">Услуги</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">Аренда</span>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Аренда</h1>
            <p className="mt-1 text-sm text-zinc-500">Аренда под любые задачи</p>
          </div>
          <div className="flex gap-2">
            <Link href="/services/rent/calculator"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
              Рассчитать аренду
            </Link>
            <button onClick={() => setShowFilters(!showFilters)}
              className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white lg:hidden">
              {showFilters ? "Скрыть" : "Фильтры"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className={`w-full shrink-0 lg:w-64 lg:block ${showFilters ? "block" : "hidden"}`}>
            <div className="sticky top-28 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">Фильтры</h2>
              {filtersPanel}
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <p className="pt-10 text-center text-zinc-500">Загрузка...</p>
            ) : filtered.length === 0 ? (
              <p className="pt-10 text-center text-zinc-600">Нет автомобилей под ваши фильтры</p>
            ) : (
                  <div className="flex flex-col gap-4">
                {filtered.map(c => <CarCard key={c.id} car={c} usdRate={usdRate} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarCard({ car, usdRate }: { car: RentCar; usdRate: number | null }) {
  const firstPhoto = car.mainPhoto || car.photos?.split(",")[0];
  const carFeatures = car.features?.split(",").map(f => f.trim()).filter(Boolean) ?? [];
  const priceLabel = getPriceLabel(car);
  const isTaxi = car.rentType?.slug === "taxi";
  const isBooked = car.bookedUntil && new Date(car.bookedUntil) > new Date();
  const amount = priceLabel ? parseInt(priceLabel.replace(/\D/g, "")) : null;
  const usdVal = usdRate && amount ? Math.round(amount / usdRate) : null;

  return (
    <Link href={`/services/rent/${car.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 sm:flex-row">
      {/* Photo */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-zinc-800 sm:h-auto sm:w-56">
        {firstPhoto ? (
          <img src={firstPhoto} alt={car.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <img src="/images/placeholder-car.webp" alt={`${car.name} — фото скоро появится`}
            className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
        )}
        {car.rentType && (
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {car.rentType.name}
          </span>
        )}
        {isBooked && (
          <span className="absolute right-2 top-2 rounded bg-amber-600/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            Бронь до {new Date(car.bookedUntil!).toLocaleDateString("ru-RU")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="text-xl font-bold text-white">{car.name}</h3>
        <p className="mt-1 text-xs text-zinc-500">
          {car.year} · {TRANSMISSION_LABEL[car.transmission ?? ""] ?? car.transmission}
          {car.transmission && car.fuel && " · "}
          {FUEL_LABEL[car.fuel ?? ""] ?? car.fuel}
          {car.engineVolume && ` · ${car.engineVolume} л`}
        </p>
        {car.description && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-2">{car.description}</p>
        )}
        {carFeatures.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {carFeatures.slice(0, 4).map(f => (
              <span key={f} className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">{f}</span>
            ))}
            {carFeatures.length > 4 && (
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">+{carFeatures.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* Price + button */}
      <div className="flex shrink-0 flex-col justify-center gap-2 border-t border-zinc-800 px-5 py-4 sm:border-l sm:border-t-0 sm:px-6 sm:w-56">
        {priceLabel ? (
          <div>
            <p className="text-xs text-zinc-500">от</p>
            <p className="text-xl font-bold text-green-400">{priceLabel}</p>
            {usdVal && <p className="text-xs text-zinc-500">≈ ${usdVal.toLocaleString()}</p>}
            {!isTaxi && <p className="mt-1 text-[10px] text-zinc-600">скидки от 3 суток</p>}
          </div>
        ) : (
          <p className="text-xs text-zinc-600">Цена не указана</p>
        )}
        <span className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 text-center w-full">
          Подробнее →
        </span>
      </div>
    </Link>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-zinc-400">{label}</p>
      {children}
    </div>
  );
}
