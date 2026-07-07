"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { getVideoUrl } from "@/lib/youtube";
import type { YTVideo } from "@/lib/youtube";

const CARD_WIDTH = 320;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

export default function VideoCarousel({ videos }: { videos: YTVideo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const max = Math.max(0, videos.length - 1);

  const scrollTo = useCallback((index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * STEP,
      behavior: "smooth",
    });
    setCurrent(index);
  }, []);

  const scroll = useCallback(
    (dir: "left" | "right") => {
      const next = dir === "left" ? current - 1 : current + 1;
      if (next < 0) scrollTo(max);
      else if (next > max) scrollTo(0);
      else scrollTo(next);
    },
    [current, max, scrollTo],
  );

  useEffect(() => {
    if (isHovered || videos.length <= 1) return;
    const timer = setInterval(() => scroll("right"), 4000);
    return () => clearInterval(timer);
  }, [isHovered, scroll, videos.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / STEP);
      setCurrent(Math.min(idx, max));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [max]);

  if (videos.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        Видео пока не загружены. Добавьте YOUTUBE_API_KEY и YOUTUBE_CHANNEL_ID
        в .env.local
      </p>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 opacity-0 shadow-lg transition-all hover:scale-110 hover:bg-zinc-700 group-hover:opacity-100 sm:flex"
        aria-label="Предыдущие"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-2 flex gap-4 overflow-x-auto px-2 pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.map((video) => (
          <a
            key={video.id}
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card snap-start shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-red-500/5"
            style={{ width: CARD_WIDTH }}
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-800">
              <img
                src={video.thumbnails.high}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover/card:bg-black/10" />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-200 transition-colors group-hover/card:text-white">
                {video.title}
              </h3>
              <p className="mt-1.5 text-xs text-zinc-600">
                {new Date(video.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </a>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 shadow-lg transition-all hover:scale-110 hover:bg-zinc-700 sm:flex"
        aria-label="Следующие"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="mt-4 flex justify-center gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current
                ? "w-6 bg-primary"
                : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
            }`}
            aria-label={`Видео ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
