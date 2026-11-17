import Reveal from "@/shared/ui/reveal";
import { IconArrowRight } from "@/shared/ui/icons";

const POINTS = ["Договор", "Прозрачные цены", "Личный подход"];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-y border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(239,68,68,0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            О проекте
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">АВТОWAY — это про честность</h2>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Автомобильные услуги без сюрпризов: аренда, подбор, продажа и перевозки.
            Показываю всё как есть, называю реальные цены и отвечаю за результат.
          </p>
        </Reveal>

        <Reveal delay={220}>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {POINTS.map(point => (
              <span
                key={point}
                className="rounded-full border border-zinc-800 bg-white/[0.03] px-3.5 py-1.5 text-xs text-zinc-300"
              >
                {point}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-7">
            <a
              href="/about"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
            >
              Подробнее о проекте
              <IconArrowRight />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
