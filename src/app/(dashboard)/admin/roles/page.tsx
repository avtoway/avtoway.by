"use client";

import { useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import RoleForm, { PERMISSION_OPTIONS } from "@/features/admin/roles/ui/role-form";
import { useFormValidation } from "@/shared/lib/use-form-validation";
import { useToast } from "@/shared/lib/toat-context";
import { RoleSchema } from "@/entities/role/role.schema";
import type { Role } from "@/features/admin/roles/types";

const INITIAL = { name: "", description: "", level: 0, permissions: [] as string[] };

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { form, setField, errors, validateField, validateAll, resetForm } = useFormValidation(RoleSchema, { ...INITIAL });

  async function fetchRoles() {
    setLoading(true);
    const res = await fetch("/api/roles");
    const json = await res.json();
    if (json.ok) setRoles(json.data);
    setLoading(false);
  }

  useEffect(() => { fetchRoles(); }, []);

  function openCreate() { resetForm({ ...INITIAL }); setEditing(null); setModalOpen(true); }

  function openEdit(r: Role) { resetForm({ name: r.name, description: r.description ?? "", level: r.level, permissions: [...r.permissions] }); setEditing(r); setModalOpen(true); }

  async function handleSave() {
    if (!validateAll()) return;
    setSaving(true);
    const body: Record<string, unknown> = { name: form.name!, description: form.description, level: form.level, permissions: form.permissions! };
    const url = editing ? `/api/roles/${editing.id}` : "/api/roles";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { setModalOpen(false); await fetchRoles(); toast(editing ? "Сохранено" : "Роль создана"); }
    else toast(json.error ?? "Ошибка сохранения", "error");
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить роль «${name}»?`)) return;
    const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
    if (res.ok) await fetchRoles();
  }

  const permLabel = (value: string) => PERMISSION_OPTIONS.find(o => o.value === value)?.label ?? value;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Роли</h1>
          <p className="mt-0.5 text-sm text-slate-500">Управление ролями и правами доступа</p>
        </div>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Создать роль</button>
      </div>

      {loading ? <p className="text-slate-500">Загрузка...</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">Уровень</th>
                <th className="px-4 py-3 font-medium text-slate-400">Название</th>
                <th className="px-4 py-3 font-medium text-slate-400">Описание</th>
                <th className="px-4 py-3 font-medium text-slate-400">Права</th>
                <th className="px-4 py-3 font-medium text-slate-400" />
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3"><span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-400">{r.level}</span></td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.description ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map(p => (
                        <span key={p} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">{permLabel(p)}</span>
                      ))}
                    </div>
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button onClick={() => openEdit(r)} className="rounded px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white">Ред</button>
                    <button onClick={() => handleDelete(r.id, r.name)} className="rounded px-3 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Редактировать роль" : "Новая роль"}>
        <RoleForm name={form.name!} onNameChange={v => setField("name", v)} onNameBlur={() => validateField("name", form.name!)}
          description={form.description ?? ""} onDescriptionChange={v => setField("description", v)}
          level={form.level} onLevelChange={v => setField("level", v)}
          permissions={form.permissions ?? []} onPermissionsChange={v => setField("permissions", v)}
          errors={errors} />
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">Отмена</button>
          <button onClick={handleSave} disabled={saving} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
