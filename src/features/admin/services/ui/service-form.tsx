"use client";

import FieldError from "@/shared/ui/field-error";
import UploadZone from "@/shared/ui/admin/upload-zone";

const ICONS = ["youtube", "car", "check-circle", "dollar"];

export interface ServiceFormData {
  slug: string;
  title: string;
  desc: string;
  href: string;
  color: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
  photo?: string;
  content?: string;
}

export default function ServiceForm({
  form, onChange, editing, errors,
}: {
  form: ServiceFormData;
  onChange: (field: string, value: any) => void;
  editing: boolean;
  errors?: Record<string, string>;
}) {
  const eb = (key: string) => errors?.[key] ? "border-red-500" : "border-slate-700";
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Slug</span>
          <input value={form.slug} onChange={e => onChange("slug", e.target.value)} disabled={editing}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("slug")}`} />
          <FieldError error={errors?.slug} /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Название</span>
          <input value={form.title} onChange={e => onChange("title", e.target.value)}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("title")}`} />
          <FieldError error={errors?.title} /></label>
        <label className="flex flex-col gap-1 col-span-2"><span className="text-xs font-medium text-slate-400">Краткое описание (на карточке)</span>
          <textarea value={form.desc} onChange={e => onChange("desc", e.target.value)} rows={2}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("desc")}`} />
          <FieldError error={errors?.desc} /></label>
        <label className="flex flex-col gap-1 col-span-2"><span className="text-xs font-medium text-slate-400">Подробное описание (на странице услуги)</span>
          <textarea value={form.content ?? ""} onChange={e => onChange("content", e.target.value)} rows={5}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("content")}`} />
          <FieldError error={errors?.content} /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Ссылка</span>
          <input value={form.href} onChange={e => onChange("href", e.target.value)}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("href")}`} />
          <FieldError error={errors?.href} /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Цвет</span>
          <input type="color" value={form.color} onChange={e => onChange("color", e.target.value)}
            className={`h-9 w-full rounded-lg border bg-slate-900 ${eb("color")}`} /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Иконка</span>
          <select value={form.iconName} onChange={e => onChange("iconName", e.target.value)}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("iconName")}`}>
            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Порядок</span>
          <input type="number" value={form.sortOrder} onChange={e => onChange("sortOrder", Number(e.target.value))}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${eb("sortOrder")}`} />
          <FieldError error={errors?.sortOrder} /></label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isActive} onChange={e => onChange("isActive", e.target.checked)}
            className="h-4 w-4 accent-red-600" />
          <span className="text-sm text-slate-400">{form.isActive ? "Показывать на сайте" : "Скрыта"}</span>
        </label>
      </div>

      <div className="rounded-xl border border-slate-800 p-4">
        <p className="mb-3 text-xs font-medium text-slate-500">Фото услуги</p>
        <UploadZone label="Загрузить фото" currentPreview={form.photo} onUpload={url => onChange("photo", url)} />
      </div>
    </div>
  );
}
