import Link from "next/link";
import Reveal from "@/shared/ui/reveal";

export default function AboutCta() {
  return (
    <section
      className="relative overflow-hidden border-t py-24 text-center"
      style={{
        borderColor: "rgba(239,68,68,0.2)",
        animation: "breathe-border 4s ease-in-out infinite",
        background: "linear-gradient(-45deg, rgba(239,68,68,0.04), rgba(59,130,246,0.04), rgba(16,185,129,0.04), rgba(239,68,68,0.04))",
        backgroundSize: "400% 400%",
      }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-10 top-10 h-20 w-20 rounded-xl border border-primary/20 bg-primary/5"
          style={{ animation: "float-shape 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-10 right-16 h-14 w-14 rounded-full border border-accent2/20 bg-accent2/5"
          style={{ animation: "float-shape 18s ease-in-out -4s infinite" }}
        />
        <div
          className="absolute left-1/3 top-1/3 h-10 w-10 rotate-45 border border-accent/20 bg-accent/5"
          style={{ animation: "float-shape 12s ease-in-out -8s infinite" }}
        />
        <div
          className="absolute right-1/4 bottom-1/4 h-16 w-16 rounded-full border border-green/20 bg-green/5"
          style={{ animation: "float-shape 16s ease-in-out -2s infinite" }}
        />
        <div
          className="absolute inset-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          style={{ animation: "beam-sweep 4s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.3), transparent 70%)", animation: "gradient-shift 7s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-[350px] w-[350px] rounded-full blur-[90px]"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)", animation: "gradient-shift 9s ease-in-out -3s infinite reverse" }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(239,68,68,0.2), transparent 70%)", animation: "pulse 2.5s ease-in-out infinite" }}
        />
      </div>

      <div className="relative mx-auto max-w-2xl px-6">
        <Reveal>
          <h2 className="mb-4 text-3xl font-bold text-white">Готовы начать?</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="mb-10 text-zinc-400">
            Посмотрите, чем я могу быть полезен, или просто подпишитесь,
            чтобы следить за проектами.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/#services"
              className="group relative inline-flex h-12 items-center overflow-hidden rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/40"
            >
              <span className="absolute inset-0 -translate-x-full rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
              <span className="relative">Наши услуги</span>
            </Link>
            <a
              href="https://youtube.com/@avtoway"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full border border-zinc-700 bg-zinc-900/80 px-8 text-sm font-medium text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white hover:shadow-xl"
            >
              YouTube канал
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
