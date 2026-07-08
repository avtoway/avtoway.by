"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { getVideoUrl } from "@/lib/youtube";
import type { YTVideo } from "@/lib/youtube";

const CARD_WIDTH = 360;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

export default function VideoCarousel({ videos }: { videos: YTVideo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const realLen = videos.length;
  const allVideos = [...videos, ...videos];
  const maxIndex = allVideos.length - 1;

  const scrollTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      scrollRef.current?.scrollTo({ left: index * STEP, behavior });
      setCurrent(index);
    },
    [],
  );

  const goNext = useCallback(() => {
    const next = current + 1;
    if (next > maxIndex) scrollTo(0, "instant");
    else scrollTo(next);
  }, [current, maxIndex, scrollTo]);

  const goPrev = useCallback(() => {
    const prev = current - 1;
    if (prev < 0) scrollTo(maxIndex, "instant");
    else scrollTo(prev);
  }, [current, maxIndex, scrollTo]);

  useEffect(() => {
    if (isHovered || realLen <= 1) return;
    const timer = setInterval(goNext, 2000);
    return () => clearInterval(timer);
  }, [isHovered, realLen, goNext]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / STEP);
      setCurrent(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
      <div className="absolute -inset-6 rounded-3xl bg-white/[0.02] backdrop-blur-sm" />

      <button
        onClick={goPrev}
        className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
        aria-label="Предыдущие"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-2 flex gap-4 overflow-x-auto px-2 pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allVideos.map((video, i) => (
          <a
            key={`${video.id}-${i}`}
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card snap-start shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-red-500/10"
            style={{ width: CARD_WIDTH }}
          >
            <div className="relative aspect-video overflow-hidden bg-zinc-800">
              <img
                src={video.thumbnails.high}
                alt={video.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover/card:bg-black/10" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
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
        onClick={goNext}
        className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
        aria-label="Следующие"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      <div className="relative z-10 mt-6 flex justify-center gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current % realLen
                ? "w-6 bg-primary shadow-sm shadow-primary/50"
                : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
            }`}
            aria-label={`Видео ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
