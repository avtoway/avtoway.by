"use client";

import { useRef, useState } from "react";

interface UploadZoneProps {
  onUpload: (url: string) => void;
  currentPreview?: string;
  label?: string;
}

export default function UploadZone({ onUpload, currentPreview, label = "Загрузить фото" }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPreview || "");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.ok) {
        setPreview(json.url);
        onUpload(json.url);
      } else {
        setPreview(currentPreview || "");
        alert(json.error ?? "Upload failed");
      }
    } catch {
      setPreview(currentPreview || "");
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800">
        {preview ? (
          <img src={preview} alt="" className="h-full w-full rounded-xl object-cover" />
        ) : (
          <span className="text-2xl font-bold text-slate-500">?</span>
        )}
      </div>
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
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
        {preview && (
          <button
            type="button"
            onClick={() => { setPreview(""); onUpload(""); }}
            className="ml-2 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-950"
          >
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}
