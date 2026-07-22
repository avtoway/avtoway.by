"use client";

import MultiSelect from "@/shared/ui/admin/multi-select";
import FieldError from "@/shared/ui/field-error";
import type { SelectOption } from "@/shared/ui/admin/multi-select";

export const PERMISSION_OPTIONS: SelectOption[] = [
  { value: "users.manage", label: "Управление сотрудниками" },
  { value: "users.roles", label: "Управление ролями" },
  { value: "users.view", label: "Просмотр сотрудников" },
  { value: "services.manage", label: "Управление услугами" },
  { value: "services.view", label: "Просмотр услуг" },
  { value: "partners.manage", label: "Управление партнёрами" },
  { value: "partners.view", label: "Просмотр партнёров" },
  { value: "audit.view", label: "Просмотр аудита" },
  { value: "rent.manage", label: "Управление арендой" },
  { value: "sell.manage", label: "Управление продажами" },
  { value: "inspection.manage", label: "Управление автоподбором" },
  { value: "truck.manage", label: "Управление эвакуатором" },
  { value: "import.manage", label: "Управление автопригоном" },
  { value: "admin", label: "Полный доступ" },
];

export default function RoleForm({
  name, onNameChange, onNameBlur,
  description, onDescriptionChange,
  level, onLevelChange,
  permissions, onPermissionsChange,
  errors,
}: {
  name: string; onNameChange: (v: string) => void; onNameBlur?: () => void;
  description: string; onDescriptionChange: (v: string) => void;
  level: number; onLevelChange: (v: number) => void;
  permissions: string[]; onPermissionsChange: (v: string[]) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">Название</span>
          <input value={name} onChange={e => onNameChange(e.target.value)} onBlur={onNameBlur}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${errors?.name ? "border-red-500" : "border-slate-700"}`} />
          <FieldError error={errors?.name} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-400">Уровень доступа</span>
          <input type="number" value={level} onChange={e => onLevelChange(Number(e.target.value))}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${errors?.level ? "border-red-500" : "border-slate-700"}`} />
          <FieldError error={errors?.level} />
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">Описание</span>
        <input value={description} onChange={e => onDescriptionChange(e.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
      </label>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">Права доступа</span>
        <MultiSelect options={PERMISSION_OPTIONS} values={permissions} onChange={onPermissionsChange}
          placeholder="Выберите права..." searchPlaceholder="Поиск права..." />
      </div>
    </div>
  );
}
