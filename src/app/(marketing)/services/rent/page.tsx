"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPriceLabel } from "@/shared/lib/price";

interface RentType { id: string; name: string; slug: string; }
interface RentCar {
  id: string; name: string; slug: string; brand?: string; model?: string;
  year?: number; color?: string; transmission?: string; fuel?: string;
  engineVolume?: string; seats?: number; features?: string;
  photos?: string; mainPhoto?: string; description?: string;
  priceDay?: number; price3Days?: number; price7Days?: number;
  priceMonth?: number; priceWeekTaxi?: number; priceDayTaxi?: number;
  rentType?: { id: string; name: string; slug: string };
  isActive: boolean;
}

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат", manual: "Механика", robot: "Робот", variator: "Вариатор",
};
const FUEL_LABEL: Record<string, string> = {
  gasoline: "Бензин", diesel: "Дизель", electric: "Электро", hybrid: "Гибрид",
  propane: "Газ (пропан)", methane: "Газ (метан)",
};

const ALL_FEATURES = [
  "Кондиционер", "Климат-контроль", "Подогрев сидений",
  "Вентиляция сидений", "Люк", "Панорамная крыша",
  "Навигация", "Apple CarPlay", "Android Auto",
  "Bluetooth", "Круиз-контроль", "Парктроники",
  "Камера заднего вида", "Кожаный салон",
];

export default function RentPage() {
  const [cars, setCars] = useState<RentCar[]>([]);
  const [types, setTypes] = useState<RentType[]>([]);
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [transmissionFilter, setTransmissionFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [seatsFilter, setSeatsFilter] = useState("");
  const [featureFilters, setFeatureFilters] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/rent").then(r => r.json()),
      fetch("/api/rent?types=true").then(r => r.json()),
      fetch("/api/exchange-rate").then(r => r.json()),
    ]).then(([cRes, tRes, eRes]) => {
      if (cRes.ok) setCars(cRes.data);
      if (tRes.ok) setTypes(tRes.data);
      if (eRes.ok) setUsdRate(eRes.rate);
      setLoading(false);
    });
  }, []);

  const filtered = cars.filter(c => {
    if (typeFilter && c.rentType?.slug !== typeFilter) return false;
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

  const FiltersPanel = () => (
    <div className="space-y-5">
      <FilterSection label="Тип аренды">
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
          <option value="">Все</option>
          {types.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Цена за день, ₽">
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
          {ALL_FEATURES.map(f => (
            <label key={f} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400 hover:text-white">
              <input type="checkbox" checked={featureFilters.has(f)} onChange={() => toggleFeature(f)}
                className="h-4 w-4 accent-red-600 rounded" />
              {f}
            </label>
          ))}
        </div>
      </FilterSection>

      <button onClick={() => { setTypeFilter(""); setPriceFrom(""); setPriceTo(""); setTransmissionFilter(""); setFuelFilter(""); setSeatsFilter(""); setFeatureFilters(new Set()); }}
        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-white">
        Сбросить
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-4 text-xs text-zinc-500">
          <a href="/" className="hover:text-white transition">Главная</a>
          <span className="mx-1">/</span>
          <a href="/services" className="hover:text-white transition">Услуги</a>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">Аренда</span>
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Аренда</h1>
            <p className="mt-1 text-sm text-zinc-500">Аренда под любые задачи</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white lg:hidden">
            {showFilters ? "Скрыть" : "Фильтры"}
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className={`w-full shrink-0 lg:w-64 lg:block ${showFilters ? "block" : "hidden"}`}>
            <div className="sticky top-28 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">Фильтры</h2>
              <FiltersPanel />
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
  const priceValue = car.priceDay ?? car.price7Days ?? car.priceWeekTaxi ?? car.price3Days ?? null;
  const usdValue = usdRate && priceValue ? Math.round(priceValue / usdRate) : null;

  return (
    <Link href={`/services/rent/${car.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 sm:flex-row">
      {/* Photo */}
      <div className="relative h-48 shrink-0 overflow-hidden bg-zinc-800 sm:h-auto sm:w-56">
        {firstPhoto ? (
          <img src={firstPhoto} alt={car.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-700">🚗</div>
        )}
        {car.rentType && (
          <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {car.rentType.name}
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
      <div className="flex shrink-0 flex-col items-end justify-center gap-1 border-t border-zinc-800 px-5 py-4 sm:border-l sm:border-t-0 sm:px-6 sm:w-48">
        {priceLabel ? (
          <>
            <p className="text-xl font-bold text-green-400 whitespace-nowrap">{priceLabel}</p>
            {usdValue && (
              <p className="text-xs text-zinc-500">≈ ${usdValue.toLocaleString()}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-zinc-600">Цена не указана</p>
        )}
        <span className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 text-center w-full mt-1">
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
