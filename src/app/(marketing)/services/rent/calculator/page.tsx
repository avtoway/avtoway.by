"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { calculateRentPrice } from "@/shared/lib/price";
import { TRANSMISSION_LABEL, FUEL_LABEL } from "@/shared/lib/car-dictionaries";

interface Car {
  id: string; name: string; slug: string; brand?: string; model?: string;
  class?: string; classDeposit?: number;
  year?: number; transmission?: string; fuel?: string; seats?: number;
  photos?: string; mainPhoto?: string;
  priceDay?: number; price3Days?: number; price7Days?: number; priceMonth?: number;
  rentType?: { id: string; name: string; slug: string };
}
interface ClassItem { id: string; name: string; slug: string; }
interface Extra { id: string; name: string; slug: string; description?: string; priceType: string; price: number; }

const inputCls = "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500";

export default function RentCalculatorPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [minDays, setMinDays] = useState(1);
  const [maxDays, setMaxDays] = useState(90);
  const [loading, setLoading] = useState(true);

  const [classFilter, setClassFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/rent").then(r => r.json()),
      fetch("/api/rent/classes").then(r => r.json()),
      fetch("/api/rent/extras").then(r => r.json()),
      fetch("/api/rent/settings").then(r => r.json()),
    ]).then(([cRes, clRes, eRes, sRes]) => {
      if (cRes.ok) setCars(cRes.data);
      if (clRes.ok) setClasses(clRes.data);
      if (eRes.ok) setExtras(eRes.data);
      if (sRes.ok) { setMinDays(sRes.data.minDays); setMaxDays(sRes.data.maxDays); }
      setLoading(false);
    });
  }, []);

  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const c of cars) if (c.brand) set.add(c.brand);
    return [...set].sort();
  }, [cars]);

  const filtered = useMemo(() => {
    return cars.filter(c => {
      if (classFilter && c.class !== classFilter) return false;
      if (brandFilter && c.brand !== brandFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${c.brand ?? ""} ${c.model ?? ""} ${c.name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [cars, classFilter, brandFilter, search]);

  const selectedCar = cars.find(c => c.id === selectedId) ?? null;

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const a = new Date(startDate).getTime();
    const b = new Date(endDate).getTime();
    if (isNaN(a) || isNaN(b) || b <= a) return 0;
    return Math.round((b - a) / 86400000);
  }, [startDate, endDate]);

  const rentalBase = selectedCar && days > 0 ? calculateRentPrice(selectedCar, days) : 0;
  const extrasTotal = useMemo(() => {
    let sum = 0;
    for (const e of extras) {
      if (!selectedExtras.has(e.id)) continue;
      sum += e.priceType === "perDay" ? e.price * Math.max(1, days) : e.price;
    }
    return sum;
  }, [extras, selectedExtras, days]);
  const total = rentalBase + extrasTotal;
  const deposit = selectedCar?.classDeposit ?? 0;

  const today = new Date().toISOString().slice(0, 10);
  const minEnd = startDate || today;

  function toggleExtra(id: string) {
    setSelectedExtras(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  const canSubmit = selectedCar && days > 0 && name.trim().length > 0;

  async function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    const extraNames = extras.filter(e => selectedExtras.has(e.id)).map(e => e.name);
    const body = {
      carId: selectedCar.id,
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      startDate, endDate,
      days,
      extras: extraNames.join(", ") || null,
      total,
      deposit: deposit || null,
      message: `Заявка из калькулятора: ${selectedCar.name}, ${days} дн. (${startDate} — ${endDate}), итог ${total} BYN, залог ${deposit || "по согласованию"} BYN.`,
    };
    const res = await fetch("/api/rent/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    setSubmitting(false);
    if (j.ok) setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6">
        {/* Breadcrumbs */}
        <div className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:text-white transition">Главная</Link>
          <span className="mx-1">/</span>
          <Link href="/services/rent" className="hover:text-white transition">Аренда</Link>
          <span className="mx-1">/</span>
          <span className="text-zinc-400">Калькулятор</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Рассчитайте аренду</h1>
          <p className="mt-2 text-sm text-zinc-500">Выберите авто, даты и опции — итог посчитается сразу. Окончательную смету согласуем до начала аренды.</p>
        </div>

        {loading ? (
          <p className="text-zinc-500">Загрузка автомобилей и тарифов…</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Left: car selection */}
            <div>
              {/* Filters */}
              <div className="mb-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setClassFilter("")}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${classFilter === "" ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                    Все классы
                  </button>
                  {classes.map(c => (
                    <button key={c.id} onClick={() => setClassFilter(classFilter === c.name ? "" : c.name)}
                      className={`rounded-full px-3 py-1.5 text-xs transition ${classFilter === c.name ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
                    <option value="">Все марки</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по названию…"
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
                </div>
              </div>

              {/* Car grid */}
              {filtered.length === 0 ? (
                <p className="pt-10 text-center text-sm text-zinc-600">Ничего не найдено.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map(c => {
                    const img = c.mainPhoto ?? c.photos?.split(",")[0];
                    const active = c.id === selectedId;
                    return (
                      <button key={c.id} onClick={() => setSelectedId(c.id)}
                        className={`overflow-hidden rounded-xl border text-left transition ${active ? "border-red-500 ring-1 ring-red-500" : "border-zinc-800 hover:border-zinc-600"}`}>
                        <div className="aspect-[16/10] bg-zinc-800">
                          {img ? <img src={img} alt={c.name} className="h-full w-full object-cover" /> : <div className="h-full w-full" />}
                        </div>
                        <div className="p-4">
                          <div className="mb-1 flex items-center justify-between">
                            <p className="font-semibold text-white">{c.brand} {c.model}</p>
                            {c.class && <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{c.class}</span>}
                          </div>
                          <p className="text-xs text-zinc-500">{c.year} · {TRANSMISSION_LABEL[c.transmission ?? ""] ?? c.transmission} · {FUEL_LABEL[c.fuel ?? ""] ?? c.fuel}</p>
                          <p className="mt-2 text-sm text-red-400">{c.priceDay != null ? `от ${c.priceDay} BYN/день` : c.priceMonth != null ? `от ${c.priceMonth} BYN/мес` : "по запросу"}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: selection + summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
                {submitted ? (
                  <div className="py-6 text-center">
                    <p className="text-2xl">✅</p>
                    <p className="mt-2 font-semibold text-white">Заявка отправлена!</p>
                    <p className="mt-1 text-sm text-zinc-500">Менеджер свяжется с вами для уточнения деталей.</p>
                  </div>
                ) : (
                  <>
                    <h2 className="mb-4 text-sm font-semibold text-white">Ваш расчёт</h2>

                    {!selectedCar && <p className="text-sm text-zinc-500">Выберите автомобиль слева.</p>}

                    {selectedCar && (
                      <div className="mb-4 rounded-lg bg-zinc-800/60 p-3">
                        <p className="text-sm font-medium text-white">{selectedCar.brand} {selectedCar.model}</p>
                        <p className="text-xs text-zinc-500">{selectedCar.class ?? "Без класса"} · залог {deposit || "по согласованию"} BYN</p>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="mb-4 grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">С даты</span>
                        <input type="date" min={today} value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500">По дату</span>
                        <input type="date" min={minEnd} value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
                      </label>
                    </div>

                    {days > 0 && days < minDays && <p className="mb-3 text-xs text-amber-400">Минимальный срок — {minDays} дн.</p>}
                    {days > maxDays && <p className="mb-3 text-xs text-amber-400">Максимальный срок — {maxDays} дн.</p>}

                    {/* Extras */}
                    {extras.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-medium text-zinc-500">Доп. опции</p>
                        <div className="space-y-2">
                          {extras.map(e => (
                            <label key={e.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-zinc-800 px-3 py-2 transition hover:border-zinc-600">
                              <input type="checkbox" checked={selectedExtras.has(e.id)} onChange={() => toggleExtra(e.id)} className="mt-0.5 h-4 w-4 accent-red-600" />
                              <span className="flex-1 text-sm text-zinc-300">{e.name}
                                <span className="block text-[10px] text-zinc-600">{e.priceType === "perDay" ? `${e.price} BYN/день` : `${e.price} BYN разово`}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {selectedCar && days > 0 && (
                      <div className="mb-4 space-y-1.5 border-t border-zinc-800 pt-4 text-sm">
                        <Row label={`Аренда · ${days} дн.`} value={`${rentalBase} BYN`} />
                        {extrasTotal > 0 && <Row label="Доп. опции" value={`${extrasTotal} BYN`} />}
                        <div className="flex items-center justify-between pt-1 text-base font-semibold text-white">
                          <span>Итого</span><span>{total} BYN</span>
                        </div>
                        <p className="text-xs text-zinc-500">Залог: {deposit || "по согласованию"} BYN (возвращается после аренды)</p>
                      </div>
                    )}

                    {/* Lead form */}
                    <div className="space-y-3">
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя *" className={inputCls} />
                      <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Телефон" className={inputCls} />
                      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
                      <button onClick={submit} disabled={!canSubmit || submitting}
                        className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
                        {submitting ? "Отправка..." : "Отправить заявку"}
                      </button>
                      <p className="text-[10px] text-zinc-600">Это предварительный расчёт. Точную смету согласуем до начала аренды.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-zinc-400">
      <span>{label}</span><span>{value}</span>
    </div>
  );
}
