import Reveal from "@/shared/ui/reveal";

const STEPS = [
  {
    title: "Оставляете заявку",
    text: "Форма на сайте, звонок или сообщение в мессенджере. Уточняем задачу, сроки и детали.",
  },
  {
    title: "Согласуем условия",
    text: "Называем цену без скрытых доплат, фиксируем договорённости и оформляем договор.",
  },
  {
    title: "Получаете результат",
    text: "Авто, продажу или переезд — с понятным отчётом и сопровождением до конца.",
  },
];

export default function ProcessSection() {
  return (
    <section
      id="process"
      className="relative scroll-mt-24 overflow-hidden border-t border-zinc-800/50 bg-zinc-950 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(239,68,68,0.07),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Как это работает
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Три шага до результата</h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Никаких сюрпризов: вы заранее знаете, что происходит, сколько это стоит и что получите в итоге.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-12">
          {/* Линия проходит только по кружкам и не заходит под карточки. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-6 top-6 hidden h-px bg-gradient-to-r from-transparent via-red-500/35 to-transparent md:block"
          />

          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 110} className="h-full">
                <div className="flex h-full flex-col items-center text-center">
                  <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-zinc-950 shadow-[0_0_0_6px_#09090b]">
                    <span className="bg-gradient-to-br from-red-300 to-red-600 bg-clip-text text-[13px] font-bold tracking-[0.12em] text-transparent">
                      0{index + 1}
                    </span>
                  </span>

                  <div className="mt-6 w-full flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-red-950/20">
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
