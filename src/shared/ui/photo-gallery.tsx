"use client";

import { useState } from "react";

export default function PhotoGallery({ photos, mainPhoto }: { photos: string[]; mainPhoto?: string }) {
  const all = photos.length > 0 ? photos : [];
  const initialIndex = mainPhoto ? all.findIndex(p => p === mainPhoto) : 0;
  const startIdx = initialIndex >= 0 ? initialIndex : 0;
  const [current, setCurrent] = useState(startIdx);

  if (all.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-zinc-800 text-5xl text-zinc-700 sm:h-96">
        🚗
      </div>
    );
  }

  const prev = () => setCurrent(c => (c === 0 ? all.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === all.length - 1 ? 0 : c + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-xl bg-zinc-800 sm:aspect-[16/9]">
        <img
          src={all[current]}
          alt={`Фото ${current + 1}`}
          className="h-full w-full object-contain transition-opacity duration-300"
        />

        {all.length > 1 && (
          <>
            <button onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7"/></svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
              {current + 1} / {all.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {all.map((url, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === current ? "border-red-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
              }`}>
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
