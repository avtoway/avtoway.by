"use client";

import { getVideoUrl } from "@/lib/youtube";
import type { YTVideo } from "@/shared/types/youtube";
import Carousel from "@/shared/ui/carousel";

export default function VideoCarousel({ videos }: { videos: YTVideo[] }) {
  if (videos.length === 0) {
    return (
      <p className="py-12 text-center text-zinc-500">
        Видео пока не загружены. Добавьте YOUTUBE_API_KEY и YOUTUBE_CHANNEL_ID
        в .env.local
      </p>
    );
  }

  return (
    <div className="relative">
      <Carousel
        items={videos}
        cardWidth={360}
        gap={16}
        autoScroll={2000}
        renderItem={(video) => (
          <a
            href={getVideoUrl(video.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="group/card block h-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition-all duration-500 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-red-500/10"
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
        )}
      />
    </div>
  );
}
