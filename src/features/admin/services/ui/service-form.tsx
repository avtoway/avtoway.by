"use client";

const ICONS = ["youtube", "car", "check-circle", "dollar"];
const ICON_MAP: Record<string, string> = { youtube: "▶", car: "🚗", "check-circle": "✓", dollar: "$" };

export interface ServiceFormData {
  slug: string;
  title: string;
  desc: string;
  href: string;
  color: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ServiceForm({
  form, onChange, editing,
}: {
  form: ServiceFormData;
  onChange: (field: string, value: any) => void;
  editing: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="mb-2 text-xs font-medium text-slate-500">Превью карточки на сайте</p>
        <div className="flex items-center gap-4 rounded-lg p-4" style={{ background: `linear-gradient(135deg, ${form.color}15, ${form.color}05)`, borderLeft: `3px solid ${form.color}` }}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: form.color + "25", color: form.color }}>{ICON_MAP[form.iconName] ?? "⚙"}</span>
          <div>
            <p className="font-semibold text-white">{form.title || "Название услуги"}</p>
            <p className="text-xs text-slate-400">{form.desc || "Описание услуги"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Slug</span>
          <input value={form.slug} onChange={e => onChange("slug", e.target.value)} disabled={editing}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Название</span>
          <input value={form.title} onChange={e => onChange("title", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        <label className="flex flex-col gap-1 col-span-2"><span className="text-xs font-medium text-slate-400">Описание</span>
          <textarea value={form.desc} onChange={e => onChange("desc", e.target.value)} rows={2}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Ссылка (href)</span>
          <input value={form.href} onChange={e => onChange("href", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Цвет</span>
          <input type="color" value={form.color} onChange={e => onChange("color", e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-700 bg-slate-900" /></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Иконка</span>
          <select value={form.iconName} onChange={e => onChange("iconName", e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500">
            {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select></label>
        <label className="flex flex-col gap-1"><span className="text-xs font-medium text-slate-400">Порядок</span>
          <input type="number" value={form.sortOrder} onChange={e => onChange("sortOrder", Number(e.target.value))}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" /></label>
        <label className="flex items-center gap-2 mt-1.5">
          <input type="checkbox" checked={form.isActive} onChange={e => onChange("isActive", e.target.checked)}
            className="h-4 w-4 accent-red-600" />
          <span className="text-sm text-slate-400">{form.isActive ? "Показывать на сайте" : "Скрыта"}</span>
        </label>
      </div>
    </div>
  );
}
