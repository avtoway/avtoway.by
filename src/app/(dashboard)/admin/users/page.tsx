"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import CreateUserForm from "@/features/admin/users-list/ui/create-user-form";
import { useFormValidation } from "@/shared/lib/use-form-validation";
import { useToast } from "@/shared/lib/toat-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { UserCreateSchema } from "@/entities/user/user.schema";
import type { SelectOption } from "@/shared/ui/admin/multi-select";

interface Role { id: string; name: string; }
interface User { id: string; name: string; login: string; email: string | null; position: string | null; phone: string | null; roles: Role[]; createdAt: string; }

const ROLE_COLORS: Record<string, string> = {
  "Администратор": "bg-red-900/50 text-red-300",
  "Редактор": "bg-blue-900/50 text-blue-300",
  "Наблюдатель": "bg-slate-800 text-slate-400",
};

const INITIAL = { name: "", login: "", email: "", password: "", roleIds: [] as string[] };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();
  const { form, setField, errors, validateField, validateAll, resetForm } = useFormValidation(UserCreateSchema, { ...INITIAL });

  async function fetchAll() {
    setLoading(true);
    const [uRes, rRes] = await Promise.all([fetch("/api/users").then(r => r.json()), fetch("/api/roles").then(r => r.json())]);
    if (uRes.ok) setUsers(uRes.data);
    if (rRes.ok) setAllRoles(rRes.data);
    setLoading(false);
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/roles").then(r => r.json()),
    ]).then(([uRes, rRes]) => {
      if (uRes.ok) setUsers(uRes.data);
      if (rRes.ok) setAllRoles(rRes.data);
      setLoading(false);
    });
  }, []);

  const roleOptions: SelectOption[] = allRoles.map(r => ({ value: r.id, label: r.name }));

  function openCreate() { resetForm({ ...INITIAL }); setEditing(null); setModalOpen(true); }

  function openEdit(u: User) {
    resetForm({ name: u.name, login: u.login, email: u.email ?? "", password: "", roleIds: u.roles.map(r => r.id) });
    setEditing(u);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!validateAll()) return;
    setSaving(true);
    const body: Record<string, unknown> = { name: form.name, login: form.login, roleIds: form.roleIds! };
    if (form.email) body.email = form.email;
    if (form.password) body.password = form.password;
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { setModalOpen(false); await fetchAll(); toast(editing ? "Сохранено" : "Пользователь создан"); }
    else toast(json.error ?? "Ошибка сохранения", "error");
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({ title: "Удаление пользователя", message: `Вы действительно хотите удалить пользователя «${name}»? Это действие нельзя отменить.`, confirmLabel: "Удалить", variant: "danger" });
    if (!ok) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await fetchAll();
    toast("Пользователь удалён");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Сотрудники</h1><p className="mt-0.5 text-sm text-slate-500">Управление пользователями и их ролями</p></div>
        <button onClick={openCreate} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">+ Добавить</button>
      </div>

      {loading ? <p className="text-slate-500">Загрузка...</p> : (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-400">ФИО</th><th className="px-4 py-3 font-medium text-slate-400">Логин</th>
                <th className="px-4 py-3 font-medium text-slate-400">Должность</th><th className="px-4 py-3 font-medium text-slate-400">Телефон</th>
                <th className="px-4 py-3 font-medium text-slate-400">Роли</th><th />
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                  <td className="px-4 py-3"><Link href={`/admin/users/${u.id}`} className="text-slate-200 hover:text-red-400 transition">{u.name}</Link></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{u.login}</td>
                  <td className="px-4 py-3 text-slate-500">{u.position ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{u.roles.map(r => <span key={r.id} className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[r.name] ?? "bg-slate-800 text-slate-400"}`}>{r.name}</span>)}</div></td>
                  <td className="flex gap-2 px-4 py-3">
                    <button onClick={() => openEdit(u)} className="rounded px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-white">Ред</button>
                    <button onClick={() => handleDelete(u.id, u.name)} className="rounded px-3 py-1 text-xs text-red-400 hover:bg-red-950 hover:text-red-300">Удл</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Редактировать сотрудника" : "Новый сотрудник"}>
        <CreateUserForm name={form.name} onNameChange={v => setField("name", v)} onNameBlur={() => validateField("name", form.name)}
          login={form.login} onLoginChange={v => setField("login", v)} onLoginBlur={() => validateField("login", form.login)}
          email={form.email ?? ""} onEmailChange={v => setField("email", v)}
          password={form.password} onPasswordChange={v => setField("password", v)}
          isEditing={!!editing} roleOptions={roleOptions} selectedRoles={form.roleIds ?? []} onRolesChange={v => setField("roleIds", v)}
          errors={errors} />
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
