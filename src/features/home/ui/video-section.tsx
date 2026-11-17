import Reveal from "@/shared/ui/reveal";
import VideoCarousel from "@/features/youtube/ui/video-carousel";
import type { Video } from "@/entities/video/video";

export default function VideoSection({ videos }: { videos: Video[] }) {
  if (videos.length === 0) return null;

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
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
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

        <Reveal delay={120}>
          <VideoCarousel videos={videos} />
        </Reveal>
      </div>
    </section>
  );
}
