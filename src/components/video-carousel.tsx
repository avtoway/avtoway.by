"use client";

import { useRef, useState } from "react";
import { getVideoUrl } from "@/lib/youtube";
import type { YTVideo } from "@/lib/youtube";

export default function VideoCarousel({ videos }: { videos: YTVideo[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  function onMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft ?? 0));
    setScrollLeft(scrollRef.current?.scrollLeft ?? 0);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft ?? 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }

  function onMouseUp() {
    setIsDragging(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 shadow-lg transition hover:scale-110 hover:bg-zinc-700 sm:flex"
        aria-label="Предыдущие видео"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className={`flex gap-4 overflow-x-auto pb-4 ${isDragging ? "cursor-grabbing" : "cursor-grab"} scrollbar-hide snap-x snap-mandatory`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {videos.length === 0 && (
          <p className="w-full py-12 text-center text-zinc-500">
            Видео пока не загружены. Добавьте YOUTUBE_API_KEY и YOUTUBE_CHANNEL_ID в .env.local
          </p>
        )}
        {videos.map((video) => (
          <a
            key={video.id}
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group snap-start shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900 transition-shadow hover:border-zinc-700 hover:shadow-lg"
            style={{ width: "clamp(260px, 30vw, 360px)" }}
          >
            <div className="aspect-video overflow-hidden rounded-t-2xl bg-zinc-800">
              <img
                src={video.thumbnails.maxres}
                alt={video.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                {video.title}
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {new Date(video.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>
          </a>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 shadow-lg transition hover:scale-110 hover:bg-zinc-700 sm:flex"
        aria-label="Следующие видео"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
