"use client";

import { useRef, useState } from "react";
import { useConfirm } from "@/shared/ui/confirm-dialog";

const BATCH_SIZE = 4;

export default function PhotoManager({
  photos,
  mainPhoto,
  onChange,
  category = "general",
  max = 40,
}: {
  photos: string[];
  mainPhoto: string;
  onChange: (photos: string[], mainPhoto: string) => void;
  category?: string;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { confirm, dialog } = useConfirm();

  async function uploadFiles(files: File[]) {
    const remaining = max - photos.length;
    const selected = files.filter(file => file.type.startsWith("image/")).slice(0, remaining);
    if (selected.length === 0) return;

    setUploading(true);
    setProgress({ done: 0, total: selected.length });
    const uploaded: string[] = [];

    for (let index = 0; index < selected.length; index += BATCH_SIZE) {
      const batch = selected.slice(index, index + BATCH_SIZE);
      const results = await Promise.all(batch.map(async file => {
        const body = new FormData();
        body.append("file", file);
        try {
          const response = await fetch(`/api/upload?category=${category}`, { method: "POST", body });
          const json = await response.json();
          return json.ok ? String(json.url) : null;
        } catch {
          return null;
        }
      }));
      uploaded.push(...results.filter((url): url is string => Boolean(url)));
      setProgress({ done: Math.min(index + BATCH_SIZE, selected.length), total: selected.length });
    }

    if (uploaded.length > 0) {
      const next = [...photos, ...uploaded];
      onChange(next, mainPhoto || next[0] || "");
    }
    setUploading(false);
    setProgress({ done: 0, total: 0 });
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    onChange(next, mainPhoto);
  }

  function remove(index: number) {
    const next = photos.filter((_, itemIndex) => itemIndex !== index);
    const removed = photos[index];
    onChange(next, mainPhoto === removed ? next[0] ?? "" : mainPhoto);
  }

  async function clearAll() {
    const ok = await confirm({
      title: "Удалить все фото?",
      message: "Фотографии будут убраны из карточки автомобиля. Действие нельзя отменить.",
      confirmLabel: "Удалить все",
      variant: "danger",
    });
    if (ok) onChange([], "");
  }

  return (
    <div className="rounded-xl border border-slate-800 p-4">
      {dialog}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">Фотографии: {photos.length} / {max}</p>
        {photos.length > 0 && (
          <button type="button" onClick={clearAll} className="text-xs text-red-400 hover:text-red-300">Удалить все фото</button>
        )}
      </div>

      <div
        onDragOver={event => { event.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={event => {
          event.preventDefault();
          setDragOver(false);
          void uploadFiles(Array.from(event.dataTransfer.files));
        }}
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition ${
          dragOver ? "border-red-500 bg-red-500/5" : "border-slate-700 bg-slate-900/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={event => {
            if (event.target.files) void uploadFiles(Array.from(event.target.files));
          }}
        />
        <p className="text-sm text-slate-300">Перетащите фото сюда или выберите файлы</p>
        <p className="mt-1 text-xs text-slate-500">JPG, PNG, WebP · до {max} фото · загрузка пачками по 4</p>
        <button
          type="button"
          disabled={uploading || photos.length >= max}
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          {uploading ? `Загружается ${progress.done} из ${progress.total}...` : "Выбрать фотографии"}
        </button>
        {uploading && (
          <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-red-600 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {photos.map((photo, index) => (
            <div key={`${photo}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-800 bg-slate-800">
              <img src={photo} alt="" className="h-full w-full object-cover" />
              {photo === mainPhoto && (
                <span className="absolute left-1.5 top-1.5 rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-medium text-white">Главная</span>
              )}
              <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 bg-black/0 p-1 opacity-0 transition group-hover:bg-black/55 group-hover:opacity-100">
                <button type="button" onClick={() => setPreview(photo)} className="rounded bg-white/20 px-1.5 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-white/40">Просмотр</button>
                {photo !== mainPhoto && (
                  <button type="button" onClick={() => onChange(photos, photo)} className="rounded bg-white/20 px-1.5 py-1 text-[10px] text-white backdrop-blur-sm hover:bg-white/40">Главной</button>
                )}
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded bg-white/20 px-1.5 py-1 text-[10px] text-white backdrop-blur-sm disabled:opacity-30">←</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === photos.length - 1} className="rounded bg-white/20 px-1.5 py-1 text-[10px] text-white backdrop-blur-sm disabled:opacity-30">→</button>
                <button type="button" onClick={() => remove(index)} className="rounded bg-red-600/80 px-1.5 py-1 text-[10px] text-white hover:bg-red-600">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-6" onClick={() => setPreview(null)}>
          <div className="relative max-h-full max-w-5xl">
            <img src={preview} alt="" className="max-h-[85vh] max-w-full object-contain" />
            <button type="button" onClick={() => setPreview(null)} className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg text-black">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
