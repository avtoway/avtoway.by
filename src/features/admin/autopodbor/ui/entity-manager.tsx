"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminModal from "@/shared/ui/admin-modal";
import UploadZone from "@/shared/ui/admin/upload-zone";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import { useDirtyForm } from "@/shared/lib/dirty-form-context";
import { getJson } from "../lib/api";

export type FieldType = "text" | "textarea" | "number" | "checkbox" | "select" | "image" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  full?: boolean;
}

export interface ColumnDef<T> {
  key: string;
  label: string;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface Identifiable {
  id: string;
  sortOrder?: number;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface EntityManagerProps<T extends Identifiable> {
  entity: string;
  title: string;
  addLabel?: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  emptyForm: Record<string, unknown>;
  toForm: (item: T) => Record<string, unknown>;
  fromForm: (form: Record<string, unknown>) => Record<string, unknown>;
  filterFn?: (item: T) => boolean;
  sortable?: boolean;
  activeKey?: "isActive" | "isPublished";
  preview?: (form: Record<string, unknown>) => React.ReactNode;
  hint?: string;
}

function toInput(value: unknown): string | boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return "";
  return String(value);
}

/** Превращает запись API в значения полей формы. */
export function formValues(item: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of keys) out[key] = toInput(item[key]);
  return out;
}

export function normalizeFields(fields: FieldDef[], form: Record<string, unknown>): Record<string, unknown> {  const out: Record<string, unknown> = {};
  for (const field of fields) {
    const value = form[field.key];
    if (field.type === "checkbox") {
      out[field.key] = Boolean(value);
    } else if (field.type === "number") {
      out[field.key] = value === "" || value == null ? undefined : Number(value);
    } else {
      out[field.key] = typeof value === "string" ? value : value ?? "";
    }
  }
  return out;
}

export default function EntityManager<T extends Identifiable>({
  entity,
  title,
  addLabel = "Добавить",
  fields,
  columns,
  emptyForm,
  toForm,
  fromForm,
  filterFn,
  sortable = true,
  activeKey = "isActive",
  preview,
  hint,
}: EntityManagerProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { setDirty } = useDirtyForm();

  const load = useCallback(async () => {
    const json = await getJson<T[]>(`/api/autopodbor/${entity}`);
    if (json?.ok && json.data) setItems(json.data);
    else toast(json?.error ?? "Не удалось загрузить список", "error");
    setLoading(false);
  }, [entity, toast]);

  // queueMicrotask: не вызываем setState синхронно в теле эффекта
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  const visible = useMemo(() => (filterFn ? items.filter(filterFn) : items), [items, filterFn]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
    setDirty(false);
  }

  function openEdit(item: T) {
    setEditing(item);
    setForm(toForm(item));
    setOpen(true);
    setDirty(false);
  }

  function close() {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setDirty(false);
  }

  function change(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = fromForm(form);
      const url = `/api/autopodbor/${entity}${editing ? `/${editing.id}` : ""}`;
      const response = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || !json.ok) {
        toast(json.error ?? "Не удалось сохранить", "error");
        return;
      }
      toast(editing ? "Сохранено" : "Добавлено");
      close();
      await load();
    } catch {
      toast("Нет связи с сервером", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: T) {
    const ok = await confirm({
      title: "Удалить запись",
      message: "Удаление необратимо. Продолжить?",
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;
    const response = await fetch(`/api/autopodbor/${entity}/${item.id}`, { method: "DELETE" });
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.ok) {
      toast("Удалено");
      await load();
    } else {
      toast(json.error ?? "Не удалось удалить", "error");
    }
  }

  async function toggleActive(item: T) {
    const full = toForm(item);
    const payload = fromForm({ ...full, [activeKey]: !item[activeKey] });
    const response = await fetch(`/api/autopodbor/${entity}/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json().catch(() => ({}));
    if (response.ok && json.ok) await load();
    else toast(json.error ?? "Не удалось изменить статус", "error");
  }

  async function move(item: T, direction: -1 | 1) {
    const index = visible.findIndex(entry => entry.id === item.id);
    const neighbor = visible[index + direction];
    if (!neighbor) return;

    const updates = [
      { item, sortOrder: index + direction + 1 },
      { item: neighbor, sortOrder: index + 1 },
    ];
    await Promise.all(updates.map(({ item: entry, sortOrder }) =>
      fetch(`/api/autopodbor/${entity}/${entry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fromForm({ ...toForm(entry), sortOrder })),
      }),
    ));
    await load();
  }

  function renderField(field: FieldDef) {
    const value = form[field.key];

    if (field.type === "checkbox") {
      return (
        <label key={field.key} className="flex items-center gap-2 pt-6 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={event => change(field.key, event.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          {field.label}
        </label>
      );
    }

    return (
      <label key={field.key} className={`flex flex-col gap-1 ${field.full ? "sm:col-span-2" : ""}`}>
        <span className="text-xs text-slate-400">{field.label}</span>

        {field.type === "select" ? (
          <select
            value={String(value ?? "")}
            onChange={event => change(field.key, event.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
          >
            <option value="">—</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            value={String(value ?? "")}
            onChange={event => change(field.key, event.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
          />
        ) : field.type === "image" ? (
          <div className="flex flex-col gap-2">
            <input
              value={String(value ?? "")}
              onChange={event => change(field.key, event.target.value)}
              placeholder={field.placeholder ?? "/uploads/autopodbor/..."}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
            />
            <UploadZone
              key={`${editing?.id ?? "new"}-${field.key}`}
              category="autopodbor"
              currentPreview={String(value ?? "")}
              onUpload={url => change(field.key, url)}
              label="Загрузить"
            />
          </div>
        ) : (
          <input
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
            value={String(value ?? "")}
            onChange={event => change(field.key, event.target.value)}
            placeholder={field.placeholder}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
          />
        )}

        {field.help && <span className="text-[11px] text-slate-600">{field.help}</span>}
      </label>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          {addLabel}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-900/60 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {sortable && <th className="w-16 px-3 py-2">Порядок</th>}
              {columns.map(column => (
                <th key={column.key} className={`px-3 py-2 ${column.className ?? ""}`}>{column.label}</th>
              ))}
              <th className="w-28 px-3 py-2 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={columns.length + (sortable ? 2 : 1)} className="px-3 py-6 text-center text-slate-500">Загрузка…</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={columns.length + (sortable ? 2 : 1)} className="px-3 py-6 text-center text-slate-500">Пока пусто. Добавьте первую запись.</td></tr>
            ) : visible.map((item, index) => {
              const active = Boolean(item[activeKey]);
              return (
                <tr key={item.id} className="align-top hover:bg-slate-900/30">
                  {sortable && (
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => void move(item, -1)} disabled={index === 0}
                          className="rounded px-1 text-slate-500 hover:text-white disabled:opacity-30" aria-label="Выше">↑</button>
                        <button type="button" onClick={() => void move(item, 1)} disabled={index === visible.length - 1}
                          className="rounded px-1 text-slate-500 hover:text-white disabled:opacity-30" aria-label="Ниже">↓</button>
                      </div>
                    </td>
                  )}
                  {columns.map(column => (
                    <td key={column.key} className={`px-3 py-2 ${column.className ?? ""}`}>
                      {column.render ? column.render(item) : String((item as Record<string, unknown>)[column.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => void toggleActive(item)}
                        className={`rounded px-2 py-1 text-xs ${active ? "text-green-400 hover:bg-green-950/40" : "text-slate-500 hover:bg-slate-800"}`}
                        title={activeKey === "isPublished" ? "Опубликовано" : "Активно"}
                      >
                        {active ? "●" : "○"}
                      </button>
                      <button type="button" onClick={() => openEdit(item)} className="rounded px-2 py-1 text-xs text-slate-300 hover:bg-slate-800">✎</button>
                      <button type="button" onClick={() => void remove(item)} className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950/40">✕</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdminModal open={open} onClose={close} title={editing ? `${title}: редактирование` : `${title}: новая запись`} size={preview ? "lg" : "md"}>
        <div className={preview ? "grid gap-6 p-6 lg:grid-cols-[1fr_260px]" : "p-6"}>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map(renderField)}
          </div>
          {preview && (
            <aside className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">Превью</p>
              {preview(form)}
            </aside>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-800 px-6 py-4">
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white">
            Отмена
          </button>
          <button type="button" onClick={() => void save()} disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60">
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}




