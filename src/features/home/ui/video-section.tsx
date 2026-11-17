import Image from "next/image";
import Reveal from "@/shared/ui/reveal";
import { getVideoUrl } from "@/shared/lib/youtube";
import type { Video } from "@/entities/video/video";

export default function VideoSection({ videos }: { videos: Video[] }) {
  const items = videos.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="videos" className="relative overflow-hidden border-t border-zinc-800/50 bg-zinc-900/30 py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 -top-20 h-[360px] w-[360px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.12), transparent 70%)" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400">YouTube</p>
              <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Последние видео</h2>
            </div>
            <a
              href="https://youtube.com/@avtoway"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-full border border-zinc-700 px-5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              Все видео →
            </a>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((video, index) => (
            <Reveal key={video.id} delay={index * 80} className="h-full">
              <a
                href={getVideoUrl(video.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="group block h-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 transition duration-300 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-red-500/10"
              >
                <div className="relative aspect-video overflow-hidden bg-zinc-800">
                  <Image
                    src={video.thumbnails.medium}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-2 py-0.5 text-[10px] text-zinc-300">
                    {new Date(video.publishedAt).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-200">
                    {video.title}
                  </h3>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
