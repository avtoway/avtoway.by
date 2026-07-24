"use client";

import { useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";

interface RentCar {
  id: string; name: string; slug: string; photos?: string;
  description?: string; price?: number; rentTypeId?: string;
  rentType?: { id: string; name: string; slug: string };
  year?: number; transmission?: string; fuel?: string;
  seats?: number; engineVolume?: string;
  isActive: boolean; sortOrder: number;
}

interface RentType {
  id: string; name: string; slug: string;
}

export default function AdminRentPage() {
  const [cars, setCars] = useState<RentCar[]>([]);
  const [types, setTypes] = useState<RentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<RentCar | null>(null);

  async function load() {
    setLoading(true);
    const [cRes, tRes] = await Promise.all([
      fetch("/api/rent").then(r => r.json()),
      fetch("/api/rent?types=true").then(r => r.json()),
    ]);
    if (cRes.ok) setCars(cRes.data);
    if (tRes.ok) setTypes(tRes.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Аренда авто</h1>
          <p className="mt-0.5 text-sm text-slate-500">Управление автомобилями</p>
        </div>
      </div>

      {loading ? <p className="text-slate-500">Загрузка...</p> : cars.length === 0 ? (
        <p className="text-slate-500">Нет автомобилей</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map(c => (
            <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <h3 className="font-semibold text-white">{c.name}</h3>
              <p className="mt-1 text-xs text-slate-500">{c.rentType?.name} · {c.year} · {c.transmission}</p>
              {c.price && <p className="mt-2 text-sm font-medium text-green-400">{c.price} ₽</p>}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/30 p-5">
        <p className="text-sm text-slate-500">Управление типами аренды пока в разработке</p>
      </div>
    </div>
  );
}
