"use client";

import { useEffect, useRef, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import PartnerCard from "@/features/admin/partners/ui/partner-card";
import PartnerForm from "@/features/admin/partners/ui/partner-form";
import { useFormValidation } from "@/shared/lib/use-form-validation";
import { PartnerSchema } from "@/entities/partner/partner.schema";
import type { Partner } from "@/features/admin/partners/types";

const EMPTY: Partner = {
  id: "", name: "", photo: "", photos: [], description: "",
  phone: "", email: "", address: "", contactPerson: "",
  website: "", instagram: "", telegram: "", vk: "", youtube: "",
  isActive: true, sortOrder: 0,
};

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const { form, setField, errors, validateAll, resetForm } = useFormValidation(PartnerSchema, EMPTY as any);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  async function loadPartners() {
    setLoading(true);
    const res = await fetch("/api/partners").then(r => r.json());
    if (res.ok) setPartners(res.data);
    setLoading(false);
  }

  useEffect(() => { loadPartners(); }, []);

  function openCreate() { resetForm({ ...EMPTY }); setEditing(null); setModalOpen(true); }

  function openEdit(p: Partner) {
    resetForm({ ...p, photo: p.photo ?? "", photos: p.photos ?? [],
      description: p.description ?? "", phone: p.phone ?? "", email: p.email ?? "",
      address: p.address ?? "", contactPerson: p.contactPerson ?? "", website: p.website ?? "",
      instagram: p.instagram ?? "", telegram: p.telegram ?? "", vk: p.vk ?? "", youtube: p.youtube ?? "" });
    setEditing(p);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!validateAll()) return;
    setSaving(true);
    const url = editing ? `/api/partners/${editing.id}` : "/api/partners";
    const method = editing ? "PUT" : "POST";
    const body: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      body[k] = v === "" ? null : v;
    }
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { setModalOpen(false); await loadPartners(); showMsg("Сохранено"); }
    else alert(json.error ?? "Ошибка");
    setSaving(false);
  }

  async function toggleActive(p: Partner) {
    await fetch(`/api/partners/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !p.isActive }) });
    await loadPartners();
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить партнёра?")) return;
    await fetch(`/api/partners/${id}`, { method: "DELETE" });
    await loadPartners();
    showMsg("Удалён");
  }

  async function handleDrop() {
    if (dragItem.current === null || dragOver.current === null || dragItem.current === dragOver.current) return;
    const arr = [...partners];
    const [moved] = arr.splice(dragItem.current, 1);
    if (!moved) return;
    arr.splice(dragOver.current, 0, moved);
    dragItem.current = null; dragOver.current = null;
    setPartners(arr);
    for (const [i, p] of arr.entries()) {
      await fetch(`/api/partners/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: i }) });
    }
  }

  let msgTimer: ReturnType<typeof setTimeout>;
  function showMsg(text: string) { setMsg(text); clearTimeout(msgTimer); msgTimer = setTimeout(() => setMsg(""), 2000); }

  const filtered = partners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const dragHandler = (idx: number) => ({
    onDragStart: () => { dragItem.current = idx; },
    onDragEnter: () => { dragOver.current = idx; },
    onDragEnd: handleDrop,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Партнёры</h1>
          <p className="mt-0.5 text-sm text-slate-500">Управление партнёрами на сайте</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Добавить</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск партнёров..." className="mb-4 w-full max-w-xs rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
      {msg && <div className="mb-4 rounded-lg bg-green-900/50 px-4 py-2 text-sm text-green-300">{msg}</div>}

      {loading ? <p className="text-slate-500">Загрузка...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, idx) => (
            <PartnerCard key={p.id} partner={p} dragHandlers={dragHandler(idx)}
              onEdit={() => openEdit(p)} onDelete={() => handleDelete(p.id)} onToggleActive={() => toggleActive(p)} />
          ))}
          {filtered.length === 0 && <p className="col-span-full pt-8 text-center text-sm text-slate-500">Нет партнёров</p>}
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} size="lg" title={editing ? "Редактировать партнёра" : "Новый партнёр"}>
        <PartnerForm form={form} onChange={setField} errors={errors} />
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
