import Reveal from "@/shared/ui/reveal";
import { IconArrowRight } from "@/shared/ui/icons";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-y border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_0%,rgba(239,68,68,0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            О проекте
          </span>
          <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">АВТОWAY — это про честность</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-lg leading-relaxed text-zinc-300">
            АВТОWAY — личный бренд и проекты про автомобили, где я показываю всё как есть.
            Честные обзоры, ремонты, лайфхаки и полезные услуги. Я делаю то, что не делают другие.
            Я делаю то, что нужно Вам.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-8">
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
