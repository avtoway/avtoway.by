"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import CreateUserForm from "@/features/admin/users-list/ui/create-user-form";
import type { SelectOption } from "@/shared/ui/admin/multi-select";

interface Role { id: string; name: string; }
interface User { id: string; name: string; login: string; email: string | null; position: string | null; phone: string | null; roles: Role[]; createdAt: string; }

const ROLE_COLORS: Record<string, string> = {
  "Администратор": "bg-red-900/50 text-red-300",
  "Редактор": "bg-blue-900/50 text-blue-300",
  "Наблюдатель": "bg-slate-800 text-slate-400",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  async function fetchAll() {
    setLoading(true);
    const [uRes, rRes] = await Promise.all([fetch("/api/users").then(r => r.json()), fetch("/api/roles").then(r => r.json())]);
    if (uRes.ok) setUsers(uRes.data);
    if (rRes.ok) setAllRoles(rRes.data);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  const roleOptions: SelectOption[] = allRoles.map(r => ({ value: r.id, label: r.name }));

  function openCreate() { setName(""); setLogin(""); setEmail(""); setPassword(""); setSelectedRoles([]); setEditing(null); setModalOpen(true); }

  function openEdit(u: User) { setName(u.name); setLogin(u.login); setEmail(u.email ?? ""); setPassword(""); setSelectedRoles(u.roles.map(r => r.id)); setEditing(u); setModalOpen(true); }

  async function handleSave() {
    setSaving(true);
    const body: Record<string, unknown> = { name, login, roleIds: selectedRoles };
    if (email) body.email = email;
    if (password) body.password = password;
    const url = editing ? `/api/users/${editing.id}` : "/api/users";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json();
    if (json.ok) { setModalOpen(false); await fetchAll(); }
    else alert(json.error ?? "Ошибка сохранения");
    setSaving(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Удалить пользователя «${name}»?`)) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    await fetchAll();
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
        <CreateUserForm name={name} onNameChange={setName} login={login} onLoginChange={setLogin}
          email={email} onEmailChange={setEmail} password={password} onPasswordChange={setPassword}
          isEditing={!!editing} roleOptions={roleOptions} selectedRoles={selectedRoles} onRolesChange={setSelectedRoles} />
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
