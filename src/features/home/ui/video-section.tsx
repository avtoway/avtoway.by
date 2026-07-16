import Reveal from "@/shared/ui/reveal";
import VideoCarousel from "@/features/youtube/ui/video-carousel";
import type { Video } from "@/entities/video/video";

export default function VideoSection({ videos }: { videos: Video[] }) {
  return (
    <section
      id="videos"
      className="relative overflow-hidden border-t border-zinc-800/50 bg-zinc-900/30 py-32"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 -top-10 h-14 w-14 rounded-xl border border-primary/20 bg-primary/5"
          style={{ animation: "float-shape 16s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-8 bottom-1/3 h-10 w-10 rotate-45 border border-accent2/20 bg-accent2/5"
          style={{ animation: "float-shape 14s ease-in-out -5s infinite" }}
        />
        <div
          className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          style={{ animation: "beam-sweep 6s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.15), transparent 70%)", animation: "gradient-shift 9s ease-in-out infinite" }}
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <h2 className="mb-14 text-center text-3xl font-bold text-white">
            Последние видео
          </h2>
        </Reveal>
        <Reveal delay={150}>
          <VideoCarousel videos={videos} />
        </Reveal>
      </div>
    </section>
  );
}
