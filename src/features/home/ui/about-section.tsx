import Reveal from "@/shared/ui/reveal";
import { IconArrowRight, IconCar, IconCheckCircle, IconDollar } from "@/shared/ui/icons";

const POINTS = [
  {
    title: "Договор",
    text: "Фиксируем условия на бумаге — без устных обещаний.",
    icon: IconCheckCircle,
  },
  {
    title: "Прозрачные цены",
    text: "Называем стоимость до начала работы, без скрытых доплат.",
    icon: IconDollar,
  },
  {
    title: "Личный подход",
    text: "Один человек ведёт задачу от заявки до результата.",
    icon: IconCar,
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden border-y border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_0%,rgba(239,68,68,0.08),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
        <Reveal>
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              О проекте
            </span>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">АВТОWAY — это про честность</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
              Автомобильные услуги без сюрпризов: аренда, подбор, продажа и перевозки.
              Показываю всё как есть, называю реальные цены и отвечаю за результат.
            </p>

            <a
              href="/about"
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
            >
              Подробнее о проекте
              <IconArrowRight />
            </a>
          </div>
        </Reveal>

        <div className="space-y-3">
          {POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <Reveal key={point.title} delay={120 + index * 90}>
                <div className="group flex items-start gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition duration-300 hover:border-red-500/30 hover:bg-zinc-900/70">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition group-hover:border-red-500/40 group-hover:bg-red-500/15">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{point.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
