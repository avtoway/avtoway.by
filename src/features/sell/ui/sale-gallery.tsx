"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FALLBACK = "/images/placeholder-car.webp";

export default function SaleGallery({
  photos,
  videoUrl,
  title,
}: {
  photos: string[];
  videoUrl?: string;
  title: string;
}) {
  const images = photos.length > 0 ? photos : [FALLBACK];
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStart = useRef<number | null>(null);

  const safeIndex = Math.min(index, images.length - 1);

  function go(delta: number) {
    setIndex(current => (current + delta + images.length) % images.length);
  }

  useEffect(() => {
    if (!lightbox) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowLeft") setIndex(current => (current - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") setIndex(current => (current + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, images.length]);

  function onTouchStart(event: React.TouchEvent) {
    touchStart.current = event.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: React.TouchEvent) {
    if (touchStart.current == null) return;
    const end = event.changedTouches[0]?.clientX ?? touchStart.current;
    const delta = end - touchStart.current;
    if (Math.abs(delta) > 45) go(delta > 0 ? -1 : 1);
    touchStart.current = null;
  }

  return (
    <>
      <div className="space-y-3">
        <div
          className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Image
            src={images[safeIndex] ?? FALLBACK}
            alt={`${title} — фото ${safeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            loading="eager"
            fetchPriority="high"
            className="object-contain"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white backdrop-blur-sm transition hover:bg-black/75"
                aria-label="Предыдущее фото"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-xl text-white backdrop-blur-sm transition hover:bg-black/75"
                aria-label="Следующее фото"
              >
                ›
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white backdrop-blur-sm transition hover:bg-black/75"
          >
            🔍 На весь экран
          </button>
          <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
            {safeIndex + 1} / {images.length}
          </span>
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 rounded-full bg-red-600/85 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-red-600"
            >
              🎥 Видеообзор
            </a>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((photo, photoIndex) => (
              <button
                key={`${photo}-${photoIndex}`}
                type="button"
                onClick={() => setIndex(photoIndex)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  photoIndex === safeIndex ? "border-red-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Фото ${photoIndex + 1}`}
              >
                <Image src={photo} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLightbox(true)}
              className="h-16 w-24 shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 text-[11px] text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              Все {images.length} фото
            </button>
          </div>
        )}
      </div>

      {lightbox && createPortal(
        <div
          className="fixed inset-0 z-[90] flex flex-col bg-black/95"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onWheel={event => {
            if (Math.abs(event.deltaY) > 40) go(event.deltaY > 0 ? 1 : -1);
          }}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-white">
            <span>{safeIndex + 1} / {images.length}</span>
            <span className="hidden sm:block text-xs text-white/50">← → — переключение · Esc — закрыть</span>
            <button type="button" onClick={() => setLightbox(false)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10">Закрыть ×</button>
          </div>
          <div className="relative flex flex-1 items-center justify-center p-3 sm:p-8">
            <Image
              src={images[safeIndex] ?? FALLBACK}
              alt={`${title} — фото ${safeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              loading="eager"
            />
            {images.length > 1 && (
              <>
                <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20" aria-label="Предыдущее фото">‹</button>
                <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20" aria-label="Следующее фото">›</button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3">
              {images.map((photo, photoIndex) => (
                <button
                  key={`${photo}-lb-${photoIndex}`}
                  type="button"
                  onClick={() => setIndex(photoIndex)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${photoIndex === safeIndex ? "border-red-500" : "border-transparent opacity-60"}`}
                >
                  <Image src={photo} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
