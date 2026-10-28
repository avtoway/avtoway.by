"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import SaleCarForm, { EMPTY_SALE_FORM, type SaleCarFormState } from "@/features/admin/sell/ui/sale-car-form";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import type { SaleCar, SaleRequest } from "@/entities/sell/sale-car.types";
import {
  SALE_REQUEST_STATUS_LABEL,
  SALE_REQUEST_TYPE_LABEL,
  SALE_STATUS_LABEL,
} from "@/shared/lib/car-dictionaries";

type Tab = "cars" | "requests";

function toForm(car: SaleCar): SaleCarFormState {
  return {
    title: car.title, slug: car.slug, brandId: car.brandId ?? "", modelId: car.modelId ?? "", generation: car.generation ?? "",
    priceUsd: String(car.priceUsd), priceByn: car.priceByn ? String(car.priceByn) : "", oldPriceUsd: car.oldPriceUsd ? String(car.oldPriceUsd) : "",
    isNegotiable: car.isNegotiable, allowExchange: car.allowExchange, allowCredit: car.allowCredit,
    year: String(car.year), mileageKm: String(car.mileageKm), bodyType: car.bodyType, transmission: car.transmission, fuel: car.fuel,
    engineVolume: car.engineVolume != null ? String(car.engineVolume) : "", enginePowerHp: car.enginePowerHp != null ? String(car.enginePowerHp) : "",
    driveType: car.driveType, color: car.color ?? "", interiorMaterial: car.interiorMaterial ?? "", interiorColor: car.interiorColor ?? "",
    steering: car.steering, seats: car.seats != null ? String(car.seats) : "", doors: car.doors != null ? String(car.doors) : "",
    condition: car.condition, ownersCount: car.ownersCount ?? "", originCountry: car.originCountry ?? "",
    customsCleared: car.customsCleared, vin: car.vin ?? "", vinVerified: car.vinVerified, originalPaint: car.originalPaint,
    noAccidents: car.noAccidents, serviceBook: car.serviceBook, isInspected: car.isInspected, expertSummary: car.expertSummary ?? "",
    bodyCheckNote: car.bodyCheckNote ?? "", techCheckNote: car.techCheckNote ?? "", legalCheckNote: car.legalCheckNote ?? "",
    diagnosticsPdf: car.diagnosticsPdf ?? "", features: [...car.features], customSpecs: [...car.customSpecs],
    description: car.description ?? "", photos: [...car.photos], mainPhoto: car.mainPhoto ?? "", videoUrl: car.videoUrl ?? "",
    city: car.city, contactName: car.contactName ?? "", contactPhone: car.contactPhone ?? "", status: car.status,
    isFeatured: car.isFeatured, isActive: car.isActive, sortOrder: String(car.sortOrder),
    seoTitle: car.seoTitle ?? "", seoDescription: car.seoDescription ?? "",
  };
}

function toPayload(form: SaleCarFormState) {
  const number = (value: string) => value.trim() === "" ? undefined : Number(value);
  return {
    title: form.title,
    slug: form.slug,
    brandId: form.brandId || undefined,
    modelId: form.modelId || undefined,
    generation: form.generation || undefined,
    priceUsd: number(form.priceUsd),
    priceByn: number(form.priceByn) ?? null,
    oldPriceUsd: number(form.oldPriceUsd) ?? null,
    isNegotiable: form.isNegotiable,
    allowExchange: form.allowExchange,
    allowCredit: form.allowCredit,
    year: number(form.year),
    mileageKm: number(form.mileageKm),
    bodyType: form.bodyType,
    transmission: form.transmission,
    fuel: form.fuel,
    engineVolume: number(form.engineVolume) ?? null,
    enginePowerHp: number(form.enginePowerHp) ?? null,
    driveType: form.driveType,
    color: form.color || undefined,
    interiorMaterial: form.interiorMaterial || undefined,
    interiorColor: form.interiorColor || undefined,
    steering: form.steering,
    seats: number(form.seats) ?? null,
    doors: number(form.doors) ?? null,
    condition: form.condition,
    ownersCount: form.ownersCount || undefined,
    originCountry: form.originCountry || undefined,
    customsCleared: form.customsCleared,
    vin: form.vin || undefined,
    vinVerified: form.vinVerified,
    originalPaint: form.originalPaint,
    noAccidents: form.noAccidents,
    serviceBook: form.serviceBook,
    isInspected: form.isInspected,
    expertSummary: form.expertSummary || undefined,
    bodyCheckNote: form.bodyCheckNote || undefined,
    techCheckNote: form.techCheckNote || undefined,
    legalCheckNote: form.legalCheckNote || undefined,
    diagnosticsPdf: form.diagnosticsPdf || undefined,
    features: form.features,
    customSpecs: form.customSpecs,
    description: form.description || undefined,
    mainPhoto: form.mainPhoto || undefined,
    photos: form.photos,
    videoUrl: form.videoUrl || undefined,
    city: form.city,
    contactName: form.contactName || undefined,
    contactPhone: form.contactPhone || undefined,
    status: form.status,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    sortOrder: number(form.sortOrder) ?? 0,
    seoTitle: form.seoTitle || undefined,
    seoDescription: form.seoDescription || undefined,
  };
}

export default function AdminSellPage() {
  const [tab, setTab] = useState<Tab>("cars");
  const [cars, setCars] = useState<SaleCar[]>([]);
  const [requests, setRequests] = useState<SaleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [requestType, setRequestType] = useState("");
  const [requestStatus, setRequestStatus] = useState("");
  const [requestSearch, setRequestSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SaleCar | null>(null);
  const [form, setForm] = useState<SaleCarFormState>({ ...EMPTY_SALE_FORM });
  const [saving, setSaving] = useState(false);
  const [usdRate, setUsdRate] = useState(3.2);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  const load = useCallback(async () => {
    const [carsResponse, requestsResponse, rateResponse] = await Promise.all([
      fetch("/api/sell?showAll=true").then(response => response.json()),
      fetch("/api/sell/requests").then(response => response.json()),
      fetch("/api/exchange-rate").then(response => response.json()),
    ]);
    if (carsResponse.ok) setCars(carsResponse.data);
    if (requestsResponse.ok) setRequests(requestsResponse.data);
    if (rateResponse.ok) setUsdRate(rateResponse.rate);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState after await)
  useEffect(() => { void load(); }, [load]);

  function setFormField(field: string, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }) as SaleCarFormState);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_SALE_FORM });
    setModal(true);
  }

  function openEdit(car: SaleCar) {
    setEditing(car);
    setForm(toForm(car));
    setModal(true);
  }

  async function save() {
    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/sell/${editing.id}` : "/api/sell", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      const json = await response.json().catch(() => ({}));
      if (!json.ok) {
        toast(json.error ?? "Ошибка сохранения", "error");
        return;
      }
      setModal(false);
      await load();
      toast(editing ? "Автомобиль сохранён" : "Автомобиль добавлен");
    } catch {
      toast("Ошибка при сохранении", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(car: SaleCar) {
    const ok = await confirm({ title: "Удалить автомобиль?", message: `«${car.title}» будет удалён из каталога.`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/sell/${car.id}`, { method: "DELETE" });
    await load();
    toast("Автомобиль удалён");
  }

  async function quickUpdate(car: SaleCar, patch: Record<string, unknown>) {
    const response = await fetch(`/api/sell/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await response.json().catch(() => ({}));
    if (json.ok) { await load(); toast("Обновлено"); }
    else toast(json.error ?? "Ошибка", "error");
  }

  async function updateRequest(request: SaleRequest, status: string) {
    const response = await fetch(`/api/sell/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await response.json().catch(() => ({}));
    if (json.ok) { await load(); toast("Статус заявки обновлён"); }
    else toast(json.error ?? "Ошибка", "error");
  }

  async function removeRequest(request: SaleRequest) {
    const ok = await confirm({ title: "Удалить заявку?", message: `Заявка от ${request.clientName} будет удалена.`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/sell/requests/${request.id}`, { method: "DELETE" });
    await load();
    toast("Заявка удалена");
  }

  const filteredCars = useMemo(() => cars.filter(car => {
    if (statusFilter && car.status !== statusFilter) return false;
    if (search && !`${car.title} ${car.vin ?? ""} ${car.brand ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [cars, statusFilter, search]);

  const filteredRequests = useMemo(() => requests.filter(request => {
    if (requestType && request.type !== requestType) return false;
    if (requestStatus && request.status !== requestStatus) return false;
    if (requestSearch && !`${request.clientName} ${request.clientPhone} ${request.carInfo ?? ""} ${request.car?.title ?? ""}`.toLowerCase().includes(requestSearch.toLowerCase())) return false;
    return true;
  }), [requests, requestType, requestStatus, requestSearch]);

  const newRequests = requests.filter(request => request.status === "new").length;

  return (
    <div>
      {dialog}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Продажа авто</h1>
          <p className="mt-0.5 text-sm text-slate-500">Каталог автомобилей и заявки</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Добавить автомобиль</button>
      </div>

      <div className="mb-5 flex gap-2 border-b border-slate-800">
        <button onClick={() => setTab("cars")} className={`border-b-2 px-3 py-2 text-sm ${tab === "cars" ? "border-red-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>Автомобили ({cars.length})</button>
        <button onClick={() => setTab("requests")} className={`border-b-2 px-3 py-2 text-sm ${tab === "requests" ? "border-red-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
          Заявки {newRequests > 0 && <span className="ml-1 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] text-white">{newRequests}</span>}
        </button>
      </div>

      {tab === "cars" ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Поиск по названию или VIN..." className="min-w-56 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Все статусы</option>
              {Object.entries(SALE_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {loading ? <p className="text-slate-500">Загрузка...</p> : filteredCars.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-800 py-16 text-center text-sm text-slate-600">Автомобилей нет. Добавьте первый.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-400">Автомобиль</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Цена</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Пробег</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Фото</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Активен</th>
                    <th className="w-40 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredCars.map(car => (
                    <tr key={car.id} className="border-b border-slate-800/50 hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded bg-slate-800">
                            {car.mainPhoto ? <img src={car.mainPhoto} alt="" className="h-full w-full object-cover" /> : null}
                          </div>
                          <div>
                            <p className="font-medium text-white">{car.title}</p>
                            <p className="text-xs text-slate-500">{car.year} · {car.city} · {car.vin ?? "VIN не указан"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-300">${car.priceUsd.toLocaleString("ru-RU")}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-400">{car.mileageKm.toLocaleString("ru-RU")} км</td>
                      <td className="px-4 py-3 text-slate-400">{car.photos.length}</td>
                      <td className="px-4 py-3">
                        <select value={car.status} onChange={event => quickUpdate(car, { status: event.target.value })} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                          {Object.entries(SALE_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => quickUpdate(car, { isActive: !car.isActive })} className={`rounded-full px-2 py-1 text-[10px] ${car.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
                          {car.isActive ? "Да" : "Нет"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1 text-xs">
                          <button onClick={() => openEdit(car)} className="rounded px-2 py-1 text-slate-300 hover:bg-slate-800">Изменить</button>
                          <a href={`/services/sell/${car.slug}`} target="_blank" rel="noopener noreferrer" className="rounded px-2 py-1 text-slate-400 hover:bg-slate-800">Открыть ↗</a>
                          <button onClick={() => remove(car)} className="rounded px-2 py-1 text-red-400 hover:bg-red-950">Удалить</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <input value={requestSearch} onChange={event => setRequestSearch(event.target.value)} placeholder="Поиск по имени, телефону или авто..." className="min-w-56 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
            <select value={requestType} onChange={event => setRequestType(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Все типы</option>
              {Object.entries(SALE_REQUEST_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={requestStatus} onChange={event => setRequestStatus(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
              <option value="">Все статусы</option>
              {Object.entries(SALE_REQUEST_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {loading ? <p className="text-slate-500">Загрузка...</p> : filteredRequests.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-800 py-16 text-center text-sm text-slate-600">Заявок нет.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-400">Клиент</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Тип</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Автомобиль / запрос</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Цена</th>
                    <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                    <th className="w-20 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(request => (
                    <tr key={request.id} className="border-b border-slate-800/50 hover:bg-slate-900/40">
                      <td className="px-4 py-3">
                        <p className="text-white">{request.clientName}</p>
                        <a href={`tel:${request.clientPhone.replace(/[^\d+]/g, "")}`} className="text-xs text-slate-400 hover:text-white">{request.clientPhone}</a>
                        <p className="text-[10px] text-slate-600">{new Date(request.createdAt).toLocaleString("ru-RU")}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{SALE_REQUEST_TYPE_LABEL[request.type] ?? request.type}</td>
                      <td className="max-w-xs px-4 py-3 text-xs text-slate-400">
                        {request.car ? <a href={`/services/sell/${request.car.slug}`} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-white">{request.car.title} ↗</a> : null}
                        {request.carInfo && <p className="mt-1">{request.carInfo}</p>}
                        {request.comment && <p className="mt-1 line-clamp-2 text-slate-600">{request.comment}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{request.offerPrice ? `$${request.offerPrice.toLocaleString("ru-RU")}` : "—"}</td>
                      <td className="px-4 py-3">
                        <select value={request.status} onChange={event => updateRequest(request, event.target.value)} className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300">
                          {Object.entries(SALE_REQUEST_STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeRequest(request)} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950">Удалить</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <AdminModal open={modal} onClose={() => setModal(false)} title={editing ? "Редактировать автомобиль" : "Новый автомобиль"} size="xl">
        <SaleCarForm form={form} onChange={setFormField} usdRate={usdRate} />
        <div className="sticky bottom-0 -mx-6 mt-5 flex justify-end gap-3 border-t border-slate-800 bg-slate-950 px-6 py-4">
          <button onClick={() => setModal(false)} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Отмена</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">{saving ? "Сохраняем..." : "Сохранить"}</button>
        </div>
      </AdminModal>
    </div>
  );
}
