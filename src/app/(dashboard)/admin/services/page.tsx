"use client";

import { useEffect, useRef, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import ServiceForm from "@/features/admin/services/ui/service-form";
import { useFormValidation } from "@/shared/lib/use-form-validation";
import { useToast } from "@/shared/lib/toat-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { ServiceSchema } from "@/entities/service/service.schema";
import type { ServiceFormData } from "@/features/admin/services/ui/service-form";

const ICON_MAP: Record<string, string> = { youtube: "▶", car: "🚗", "check-circle": "✓", dollar: "$" };

const INITIAL_SERVICE: ServiceFormData = { slug: "", title: "", desc: "", href: "", color: "#ef4444", iconName: "car", isActive: true, sortOrder: 0 };

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const { form, setField, errors, validateAll, resetForm } = useFormValidation(ServiceSchema, INITIAL_SERVICE as any);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  async function fetchServices() {
    setLoading(true);
    const res = await fetch("/api/services").then(r => r.json());
    if (res.ok) setServices(res.data);
    setLoading(false);
  }

  useEffect(() => { fetchServices(); }, []);

  function openCreate() { resetForm({ slug: "", title: "", desc: "", href: "/", color: "#ef4444", iconName: "car", isActive: true, sortOrder: services.length }); setEditing(null); setModalOpen(true); }

  function openEdit(s: ServiceFormData) { resetForm({ ...s }); setEditing(s); setModalOpen(true); }

  async function handleSave() {
    if (!validateAll()) return;
    setSaving(true);
    const url = editing ? `/api/services/${editing.slug}` : "/api/services";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const json = await res.json();
    if (json.ok) { setModalOpen(false); await fetchServices(); toast(editing ? "Сохранено" : "Услуга создана"); }
    else toast(json.error ?? "Ошибка", "error");
    setSaving(false);
  }

  async function toggleActive(s: ServiceFormData) {
    await fetch(`/api/services/${s.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !s.isActive }) });
    await fetchServices();
  }

  async function handleDelete(slug: string) {
    const ok = await confirm({ title: "Удаление услуги", message: "Вы действительно хотите удалить услугу?", confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    const res = await fetch(`/api/services/${slug}`, { method: "DELETE" });
    if (res.ok) { await fetchServices(); toast("Услуга удалена"); }
  }

  async function handleDrop() {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) return;
    const arr = [...services];
    const [moved] = arr.splice(dragItem.current, 1);
    if (!moved) return;
    arr.splice(dragOver.current, 0, moved);
    dragItem.current = null; dragOver.current = null;
    setServices(arr);
    for (const [i, s] of arr.entries()) {
      await fetch(`/api/services/${s.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: i }) });
    }
  }

  const filtered = services.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Услуги</h1><p className="mt-0.5 text-sm text-slate-500">Управление списком и порядком услуг на сайте</p></div>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Добавить</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск услуг..." className="mb-4 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
      {loading ? <p className="text-slate-500">Загрузка...</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="w-8 px-2 py-3" /><th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Slug</th><th className="px-4 py-3 font-medium text-slate-400">Порядок</th>
                <th className="px-4 py-3 font-medium text-slate-400">Статус</th><th className="px-4 py-3 font-medium text-slate-400">Превью</th><th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr key={s.slug} draggable onDragStart={() => { dragItem.current = idx; }} onDragEnter={() => { dragOver.current = idx; }}
                  onDragEnd={handleDrop} onDragOver={e => e.preventDefault()}
                  className={`border-b border-slate-800/50 transition hover:bg-slate-900/50 ${!s.isActive ? "opacity-40" : ""}`}>
                  <td className="px-2 py-3 text-slate-600 cursor-grab active:cursor-grabbing">⠿</td>
                  <td className="px-4 py-3 font-medium">{s.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{s.sortOrder}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(s)}
                      className={`rounded px-2.5 py-1 text-xs font-medium transition ${s.isActive ? "bg-green-900/50 text-green-300 hover:bg-green-900/80" : "bg-slate-800 text-slate-500 hover:bg-slate-700"}`}>
                      {s.isActive ? "Вкл" : "Выкл"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: s.color + "20", color: s.color }}>{ICON_MAP[s.iconName] ?? "⚙"}</span>
                      <div><p className="text-xs font-medium">{s.title}</p><p className="text-[10px] text-slate-600">{s.desc.slice(0, 40)}...</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="rounded px-2.5 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-white">Ред</button>
                      <button onClick={() => handleDelete(s.slug)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Редактировать услугу" : "Новая услуга"}>
        <ServiceForm form={form as any} onChange={setField} editing={!!editing} errors={errors} />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </AdminModal>
      {dialog}
    </div>
  );
}
