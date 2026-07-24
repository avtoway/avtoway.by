"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  onUpload?: (url: string) => void;
  onUploadMultiple?: (urls: string[]) => void;
  currentPreview?: string;
  label?: string;
  multiple?: boolean;
}

export default function UploadZone({ onUpload, onUploadMultiple, currentPreview, label = "Загрузить фото", multiple }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPreview || "");

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();
    return json.ok ? json.url : null;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    if (multiple && onUploadMultiple) {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        if (url) urls.push(url);
      }
      if (urls.length > 0) onUploadMultiple(urls);
    } else {
      const file = files[0];
      if (!file) { setUploading(false); return; }
      const localUrl = URL.createObjectURL(file);
      setPreview(localUrl);
      const url = await uploadFile(file);
      if (url) {
        setPreview(url);
        onUpload?.(url);
      } else {
        setPreview(currentPreview || "");
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full rounded-xl object-cover" />
        ) : (
          <span className={`text-2xl font-bold ${multiple ? "text-slate-600" : "text-slate-500"}`}>{multiple ? "+" : "?"}</span>
        )}
      </div>
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          multiple={multiple}
          onChange={handleFile}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          {uploading ? "Загрузка..." : label}
        </button>
        {preview && !multiple && (
          <button
            type="button"
            onClick={() => { setPreview(""); onUpload?.(""); }}
            className="ml-2 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
