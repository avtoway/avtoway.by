"use client";

import { useCallback, useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";

interface CarClassItem { id: string; name: string; slug: string; sortOrder: number; deposit?: number; minAge?: number; }
interface ExtraItem { id: string; name: string; slug: string; description?: string; priceType: string; price: number; isActive: boolean; sortOrder: number; }
interface RentRequestItem {
  id: string; car?: { id: string; name: string; slug: string }; name: string; phone?: string; email?: string;
  startDate?: string; endDate?: string; days?: number; extras?: string; total?: number; deposit?: number;
  status: string; message?: string; createdAt: string;
}

type Tab = "classes" | "extras" | "conditions" | "tiers" | "settings" | "requests";

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Готово",
  cancelled: "Отменена",
};

export default function AdminRentCalculatorPage() {
  const [tab, setTab] = useState<Tab>("classes");
  const { dialog } = useConfirm();

  const tabs: { id: Tab; label: string }[] = [
    { id: "classes", label: "Классы" },
    { id: "extras", label: "Доп. опции" },
    { id: "conditions", label: "Условия" },
    { id: "tiers", label: "Тарифы" },
    { id: "settings", label: "Настройки" },
    { id: "requests", label: "Заявки" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Калькулятор аренды</h1>
        <p className="mt-0.5 text-sm text-slate-500">Классы авто, доп. опции, настройки и заявки из калькулятора</p>
      </div>

      <div className="mb-6 flex gap-1 border-b border-slate-800">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm transition ${tab === t.id ? "border-red-500 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "classes" && <ClassesTab />}
      {tab === "extras" && <ExtrasTab />}
      {tab === "conditions" && <ConditionsTab />}
      {tab === "tiers" && <TiersTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "requests" && <RequestsTab />}

      {dialog}
    </div>
  );
}

/* ───────────── Classes ───────────── */

const EMPTY_CLASS = { name: "", slug: "", sortOrder: "0", deposit: "", minAge: "" };

function ClassesTab() {
  const [items, setItems] = useState<CarClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<CarClassItem | null>(null);
  const [form, setForm] = useState(EMPTY_CLASS);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/rent/classes");
    const j = await res.json();
    if (j.ok) setItems(j.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_CLASS }); setEditing(null); setModal(true); }
  function openEdit(c: CarClassItem) {
    setForm({ name: c.name, slug: c.slug, sortOrder: String(c.sortOrder ?? 0), deposit: c.deposit?.toString() ?? "", minAge: c.minAge?.toString() ?? "" });
    setEditing(c); setModal(true);
  }

  async function save() {
    setSaving(true);
    const body = {
      name: form.name, slug: form.slug,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
      deposit: form.deposit ? parseInt(form.deposit, 10) : null,
      minAge: form.minAge ? parseInt(form.minAge, 10) : null,
    };
    const url = editing ? `/api/rent/classes/${editing.id}` : "/api/rent/classes";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (j.ok) { setModal(false); await load(); toast(editing ? "Сохранено" : "Класс добавлен"); }
    else toast(j.error ?? "Ошибка", "error");
    setSaving(false);
  }

  async function remove(c: CarClassItem) {
    const ok = await confirm({ title: "Удалить класс", message: `Удалить «${c.name}»? Авто останутся без класса.`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/classes/${c.id}`, { method: "DELETE" });
    await load();
    toast("Класс удалён");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Класс</button>
      </div>
      {loading ? <p className="text-slate-500">Загрузка...</p> : items.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Нет классов.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Slug</th>
                <th className="px-4 py-3 font-medium text-slate-400">Залог, BYN</th>
                <th className="px-4 py-3 font-medium text-slate-400">Мин. возраст</th>
                <th className="px-4 py-3 font-medium text-slate-400">Порядок</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c.slug}</td>
                  <td className="px-4 py-3 text-slate-300">{c.deposit ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{c.minAge ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => remove(c)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal} onClose={() => setModal(false)} title={editing ? "Редактировать класс" : "Новый класс"}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Slug"><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} /></Field>
          <Field label="Залог (BYN)"><input type="number" value={form.deposit} onChange={e => setForm(f => ({ ...f, deposit: e.target.value }))} className={inputCls} /></Field>
          <Field label="Мин. возраст"><input type="number" value={form.minAge} onChange={e => setForm(f => ({ ...f, minAge: e.target.value }))} className={inputCls} /></Field>
          <Field label="Порядок"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className={inputCls} /></Field>
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Отмена</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
        </div>
      </AdminModal>
    </div>
  );
}

/* ───────────── Extras ───────────── */

const EMPTY_EXTRA = { name: "", slug: "", description: "", priceType: "perDay", price: "0", isActive: true, sortOrder: "0" };

function ExtrasTab() {
  const [items, setItems] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<ExtraItem | null>(null);
  const [form, setForm] = useState(EMPTY_EXTRA);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/rent/extras?showAll=true");
    const j = await res.json();
    if (j.ok) setItems(j.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_EXTRA }); setEditing(null); setModal(true); }
  function openEdit(e: ExtraItem) {
    setForm({ name: e.name, slug: e.slug, description: e.description ?? "", priceType: e.priceType, price: String(e.price ?? 0), isActive: e.isActive, sortOrder: String(e.sortOrder ?? 0) });
    setEditing(e); setModal(true);
  }

  async function save() {
    setSaving(true);
    const body = {
      name: form.name, slug: form.slug, description: form.description || null,
      priceType: form.priceType, price: parseInt(form.price, 10) || 0,
      isActive: form.isActive, sortOrder: parseInt(form.sortOrder, 10) || 0,
    };
    const url = editing ? `/api/rent/extras/${editing.id}` : "/api/rent/extras";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (j.ok) { setModal(false); await load(); toast(editing ? "Сохранено" : "Опция добавлена"); }
    else toast(j.error ?? "Ошибка", "error");
    setSaving(false);
  }

  async function remove(e: ExtraItem) {
    const ok = await confirm({ title: "Удалить опцию", message: `Удалить «${e.name}»?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/extras/${e.id}`, { method: "DELETE" });
    await load();
    toast("Опция удалена");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Опция</button>
      </div>
      {loading ? <p className="text-slate-500">Загрузка...</p> : items.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Нет опций.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Тип цены</th>
                <th className="px-4 py-3 font-medium text-slate-400">Цена, BYN</th>
                <th className="px-4 py-3 font-medium text-slate-400">Активна</th>
                <th className="px-4 py-3 font-medium text-slate-400">Порядок</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map(e => (
                <tr key={e.id} className={`border-b border-slate-800/50 hover:bg-slate-900/50 ${!e.isActive ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{e.name}</p>
                    {e.description && <p className="text-[10px] text-slate-600">{e.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{e.priceType === "perDay" ? "за день" : "за аренду"}</td>
                  <td className="px-4 py-3 text-slate-300">{e.price}</td>
                  <td className="px-4 py-3 text-slate-300">{e.isActive ? "Да" : "Нет"}</td>
                  <td className="px-4 py-3 text-slate-500">{e.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(e)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => remove(e)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal} onClose={() => setModal(false)} title={editing ? "Редактировать опцию" : "Новая опция"}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Slug"><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} /></Field>
          <Field label="Описание" span>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Тип цены">
            <select value={form.priceType} onChange={e => setForm(f => ({ ...f, priceType: e.target.value }))} className={inputCls}>
              <option value="perDay">за день</option>
              <option value="perRental">за аренду</option>
            </select>
          </Field>
          <Field label="Цена, BYN"><input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputCls} /></Field>
          <Field label="Порядок"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className={inputCls} /></Field>
          <label className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4 accent-red-600" />
            <span className="text-sm text-slate-400">Активна (видна в калькуляторе)</span>
          </label>
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Отмена</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
        </div>
      </AdminModal>
    </div>
  );
}

/* ───────────── Conditions ───────────── */

const EMPTY_CONDITION = { name: "", slug: "", placeholder: "", sortOrder: "0" };

function ConditionsTab() {
  const [items, setItems] = useState<{ id: string; name: string; slug: string; placeholder?: string; sortOrder: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; slug: string; placeholder?: string; sortOrder: number } | null>(null);
  const [form, setForm] = useState(EMPTY_CONDITION);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/rent/conditions");
    const j = await res.json();
    if (j.ok) setItems(j.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_CONDITION }); setEditing(null); setModal(true); }
  function openEdit(c: { id: string; name: string; slug: string; placeholder?: string; sortOrder: number }) {
    setForm({ name: c.name, slug: c.slug, placeholder: c.placeholder ?? "", sortOrder: String(c.sortOrder ?? 0) });
    setEditing(c); setModal(true);
  }

  async function save() {
    setSaving(true);
    const body = { name: form.name, slug: form.slug, placeholder: form.placeholder || null, sortOrder: parseInt(form.sortOrder, 10) || 0 };
    const url = editing ? `/api/rent/conditions/${editing.id}` : "/api/rent/conditions";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (j.ok) { setModal(false); await load(); toast(editing ? "Сохранено" : "Условие добавлено"); }
    else toast(j.error ?? "Ошибка", "error");
    setSaving(false);
  }

  async function remove(c: { id: string; name: string }) {
    const ok = await confirm({ title: "Удалить условие", message: `Удалить «${c.name}»?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/conditions/${c.id}`, { method: "DELETE" });
    await load();
    toast("Условие удалено");
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Условие</button>
      </div>
      {loading ? <p className="text-slate-500">Загрузка...</p> : items.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Нет условий.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Slug</th>
                <th className="px-4 py-3 font-medium text-slate-400">Подсказка</th>
                <th className="px-4 py-3 font-medium text-slate-400">Порядок</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{c.slug}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{c.placeholder ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => remove(c)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal} onClose={() => setModal(false)} title={editing ? "Редактировать условие" : "Новое условие"}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Название"><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <Field label="Slug"><input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className={inputCls} /></Field>
          <Field label="Подсказка (placeholder)" span>
            <input value={form.placeholder} onChange={e => setForm(f => ({ ...f, placeholder: e.target.value }))} className={inputCls} />
          </Field>
          <Field label="Порядок"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className={inputCls} /></Field>
        </div>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Отмена</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
        </div>
      </AdminModal>
    </div>
  );
}

/* ───────────── Pricing tiers ───────────── */

const EMPTY_TIER = { minDays: "1", maxDays: "", discount: "0", sortOrder: "0" };

function tierLabel(min: number, max: number | null) {
  return max == null ? `${min}+ суток` : `${min}–${max} суток`;
}

function TiersTab() {
  const [items, setItems] = useState<{ id: string; minDays: number; maxDays?: number | null; discount: number; sortOrder: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<{ id: string; minDays: number; maxDays?: number | null; discount: number; sortOrder: number } | null>(null);
  const [form, setForm] = useState(EMPTY_TIER);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/rent/pricing-tiers");
    const j = await res.json();
    if (j.ok) setItems(j.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, [load]);

  function openCreate() { setForm({ ...EMPTY_TIER }); setEditing(null); setModal(true); }
  function openEdit(t: { id: string; minDays: number; maxDays?: number | null; discount: number; sortOrder: number }) {
    setForm({ minDays: String(t.minDays), maxDays: t.maxDays != null ? String(t.maxDays) : "", discount: String(t.discount ?? 0), sortOrder: String(t.sortOrder ?? 0) });
    setEditing(t); setModal(true);
  }

  async function save() {
    setSaving(true);
    const body = {
      minDays: parseInt(form.minDays, 10) || 1,
      maxDays: form.maxDays ? parseInt(form.maxDays, 10) : null,
      discount: parseInt(form.discount, 10) || 0,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    };
    const url = editing ? `/api/rent/pricing-tiers/${editing.id}` : "/api/rent/pricing-tiers";
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json();
    if (j.ok) { setModal(false); await load(); toast(editing ? "Сохранено" : "Ступень добавлена"); }
    else toast(j.error ?? "Ошибка", "error");
    setSaving(false);
  }

  async function remove(t: { id: string; minDays: number; maxDays?: number | null }) {
    const ok = await confirm({ title: "Удалить ступень", message: `Удалить ступень «${tierLabel(t.minDays, t.maxDays ?? null)}»?`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/pricing-tiers/${t.id}`, { method: "DELETE" });
    await load();
    toast("Ступень удалена");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Ступени применяются к цене за сутки (личные цели). Чем дольше срок — тем дешевле.</p>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Ступень</button>
      </div>
      {loading ? <p className="text-slate-500">Загрузка...</p> : items.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Нет ступеней. Добавьте хотя бы одну.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Период</th>
                <th className="px-4 py-3 font-medium text-slate-400">Скидка, %</th>
                <th className="px-4 py-3 font-medium text-slate-400">Порядок</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{tierLabel(t.minDays, t.maxDays ?? null)}</td>
                  <td className="px-4 py-3 text-green-400">{t.discount}%</td>
                  <td className="px-4 py-3 text-slate-500">{t.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => remove(t)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modal} onClose={() => setModal(false)} title={editing ? "Редактировать ступень" : "Новая ступень"}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="От (суток)"><input type="number" value={form.minDays} onChange={e => setForm(f => ({ ...f, minDays: e.target.value }))} className={inputCls} /></Field>
          <Field label="До (суток, пусто = ∞)"><input type="number" value={form.maxDays} onChange={e => setForm(f => ({ ...f, maxDays: e.target.value }))} className={inputCls} /></Field>
          <Field label="Скидка, %"><input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className={inputCls} /></Field>
          <Field label="Порядок"><input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className={inputCls} /></Field>
        </div>
        <p className="mt-3 text-xs text-slate-500">Пример: «3–7 суток, 10%» — при аренде на 3–7 дней цена за сутки = базовая × 0.9.</p>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800">Отмена</button>
          <button onClick={save} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
        </div>
      </AdminModal>
    </div>
  );
}

/* ───────────── Settings ───────────── */

function SettingsTab() {
  const [minDays, setMinDays] = useState("1");
  const [maxDays, setMaxDays] = useState("90");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/rent/settings").then(r => r.json()).then(j => {
      if (j.ok) { setMinDays(String(j.data.minDays)); setMaxDays(String(j.data.maxDays)); }
    });
  }, []);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/rent/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minDays: parseInt(minDays, 10), maxDays: parseInt(maxDays, 10) }),
    });
    const j = await res.json();
    if (j.ok) toast("Настройки сохранены");
    else toast(j.error ?? "Ошибка", "error");
    setSaving(false);
  }

  return (
    <div className="max-w-lg rounded-xl border border-slate-800 p-6">
      <h3 className="mb-4 text-sm font-semibold text-white">Параметры расчёта</h3>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Мин. срок (дней)"><input type="number" value={minDays} onChange={e => setMinDays(e.target.value)} className={inputCls} /></Field>
        <Field label="Макс. срок (дней)"><input type="number" value={maxDays} onChange={e => setMaxDays(e.target.value)} className={inputCls} /></Field>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Скидки за срок задаются во вкладке «Тарифы». Такси — отдельно, от недели (цена за неделю у автомобиля).
      </p>
      <button onClick={save} disabled={saving} className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">{saving ? "Сохранение..." : "Сохранить"}</button>
    </div>
  );
}

/* ───────────── Requests ───────────── */

function RequestsTab() {
  const [items, setItems] = useState<RentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = useCallback(async () => {
    const res = await fetch("/api/rent/requests");
    const j = await res.json();
    if (j.ok) setItems(j.data);
    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount (setState only after await)
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/rent/requests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  }

  async function remove(id: string) {
    const ok = await confirm({ title: "Удалить заявку", message: "Удалить заявку из калькулятора?", confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/rent/requests/${id}`, { method: "DELETE" });
    await load();
    toast("Заявка удалена");
  }

  return (
    <div>
      {loading ? <p className="text-slate-500">Загрузка...</p> : items.length === 0 ? (
        <p className="pt-10 text-center text-sm text-slate-600">Заявок пока нет.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Авто</th>
                <th className="px-4 py-3 font-medium text-slate-400">Клиент</th>
                <th className="px-4 py-3 font-medium text-slate-400">Период</th>
                <th className="px-4 py-3 font-medium text-slate-400">Итог</th>
                <th className="px-4 py-3 font-medium text-slate-400">Статус</th>
                <th className="px-4 py-3 font-medium text-slate-400">Дата</th>
                <th className="w-20 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{r.car?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p className="text-white">{r.name}</p>
                    <p className="text-[10px] text-slate-600">{r.phone ?? r.email ?? ""}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {r.startDate && r.endDate ? `${fmtDate(r.startDate)} — ${fmtDate(r.endDate)}` : "—"}
                    {r.days ? ` · ${r.days} дн.` : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-green-400">{r.total != null ? `${r.total} BYN` : "—"}</td>
                  <td className="px-4 py-3">
                    <select value={r.status} onChange={e => setStatus(r.id, e.target.value)}
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white outline-none">
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(r.createdAt.slice(0, 10))}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(r.id)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────── Helpers ───────────── */

const inputCls = "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";

function Field({ label, children, span }: { label: string; children: React.ReactNode; span?: boolean }) {
  return (
    <label className={`flex flex-col gap-1 ${span ? "col-span-2" : ""}`}>
      <span className="text-xs text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function fmtDate(s: string) {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" });
}
