"use client";

import { useRef, useState } from "react";
import UploadZone from "@/shared/ui/admin/upload-zone";
import FieldError from "@/shared/ui/field-error";
import type { Partner } from "../types";

export default function PartnerForm({
  form,
  onChange,
  errors,
}: {
  form: Partner;
  onChange: (field: string, value: unknown) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <UploadZone label="Загрузить основное фото" currentPreview={form.photo} onUpload={url => onChange("photo", url)} />

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs font-medium text-slate-400">Название *</span>
          <input value={form.name} onChange={e => onChange("name", e.target.value)}
            className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500 ${errors?.name ? "border-red-500" : "border-slate-700"}`} />
          <FieldError error={errors?.name} />
        </label>
        <label className="flex flex-col gap-1 col-span-2">
          <span className="text-xs font-medium text-slate-400">Описание</span>
          <textarea value={form.description} onChange={e => onChange("description", e.target.value)} rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500" />
        </label>
      </div>

      <fieldset className="rounded-lg border border-slate-800 p-4">
        <legend className="text-xs font-medium text-slate-400 px-1">Контакты</legend>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Контактное лицо" value={form.contactPerson} onChange={v => onChange("contactPerson", v)} />
          <Input label="Телефон" value={form.phone} onChange={v => onChange("phone", v)} />
          <Input label="Email" value={form.email} onChange={v => onChange("email", v)} />
          <Input label="Адрес" value={form.address} onChange={v => onChange("address", v)} />
        </div>
      </fieldset>

      <fieldset className="rounded-lg border border-slate-800 p-4">
        <legend className="text-xs font-medium text-slate-400 px-1">Сайт и соцсети</legend>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Сайт" value={form.website} onChange={v => onChange("website", v)} placeholder="https://..." />
          <Input label="Instagram" value={form.instagram} onChange={v => onChange("instagram", v)} placeholder="https://instagram.com/..." />
          <Input label="Telegram" value={form.telegram} onChange={v => onChange("telegram", v)} placeholder="https://t.me/..." />
          <Input label="VK" value={form.vk} onChange={v => onChange("vk", v)} placeholder="https://vk.com/..." />
          <Input label="YouTube" value={form.youtube} onChange={v => onChange("youtube", v)} placeholder="https://youtube.com/..." />
        </div>
      </fieldset>

      <AlbumSection photos={form.photos ?? []} onAdd={url => onChange("photos", [...(form.photos ?? []), url])} onRemove={url => onChange("photos", (form.photos ?? []).filter((x: string) => x !== url))} />

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.isActive} onChange={e => onChange("isActive", e.target.checked)}
          className="h-4 w-4 accent-red-600" />
        <span className="text-sm text-slate-300">Активен (показывать на сайте)</span>
      </label>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <input value={value ?? ""} onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
        placeholder={placeholder} />
    </label>
  );
}

function AlbumSection({ photos, onAdd, onRemove }: { photos: string[]; onAdd: (url: string) => void; onRemove: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (json.ok) onAdd(json.url);
    } finally { setUploading(false); }
  }

  return (
    <fieldset className="rounded-lg border border-slate-800 p-4">
      <legend className="text-xs font-medium text-slate-400 px-1">Альбом фотографий</legend>
      <p className="mb-3 text-[10px] text-slate-500">Дополнительные фото партнёра (необязательно)</p>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="group relative aspect-video overflow-hidden rounded-lg bg-slate-800">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onRemove(url)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600">×</button>
          </div>
        ))}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
          className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-slate-700 text-2xl text-slate-600 transition hover:border-slate-500 hover:text-slate-400 disabled:opacity-50">
          {uploading ? "..." : "+"}
        </button>
      </div>
    </fieldset>
  );
}
