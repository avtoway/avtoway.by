"use client";

import MultiSelect from "@/shared/ui/admin/multi-select";
import type { SelectOption } from "@/shared/ui/admin/multi-select";

export default function CreateUserForm({
  name, onNameChange,
  login, onLoginChange,
  email, onEmailChange,
  password, onPasswordChange,
  isEditing,
  roleOptions, selectedRoles, onRolesChange,
}: {
  name: string; onNameChange: (v: string) => void;
  login: string; onLoginChange: (v: string) => void;
  email: string; onEmailChange: (v: string) => void;
  password: string; onPasswordChange: (v: string) => void;
  isEditing: boolean;
  roleOptions: SelectOption[];
  selectedRoles: string[]; onRolesChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">ФИО</span>
        <input value={name} onChange={e => onNameChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" required /></label>
      <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Логин</span>
        <input value={login} onChange={e => onLoginChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" required /></label>
      <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Email</span>
        <input type="email" value={email} onChange={e => onEmailChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none" /></label>
      <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">{isEditing ? "Новый пароль (оставьте пустым)" : "Пароль"}</span>
        <input type="password" value={password} onChange={e => onPasswordChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none" /></label>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">Роли</span>
        <MultiSelect options={roleOptions} values={selectedRoles} onChange={onRolesChange}
          placeholder="Выберите роли..." searchPlaceholder="Поиск роли..." />
      </div>
    </div>
  );
}
