import Link from "next/link";
import { IconArrowRight, IconBoxes, IconCar, IconCheckCircle, IconDollar } from "@/shared/ui/icons";

const TASKS = [
  {
    title: "Нужна машина на время",
    text: "Аренда по дням и неделям, в том числе под такси. Прозрачные цены и залог.",
    href: "/services/rent",
    icon: IconCar,
  },
  {
    title: "Проверить или купить авто",
    text: "Автоподбор и осмотр перед покупкой: кузов, техника, документы, торг.",
    href: "/services/inspection",
    icon: IconCheckCircle,
  },
  {
    title: "Продать авто выгодно",
    text: "Поможем продать или принять авто в зачёт. Проверка и реклама включены.",
    href: "/services/sell",
    icon: IconDollar,
  },
  {
    title: "Эвакуатор и перевозки",
    text: "Эвакуация авто 24/7, автосервис и грузоперевозки по Минску и Беларуси.",
    href: "/services/truck",
    icon: IconBoxes,
  },
] as const;

export default function TaskSection() {
  return (
    <section id="tasks" className="border-b border-zinc-800/60 bg-zinc-950 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            С чего начнём
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Выберите задачу — мы сделаем остальное</h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Один подрядчик на все автомобильные задачи: аренда, подбор, продажа, эвакуатор и сервис.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TASKS.map(task => {
            const Icon = task.icon;
            return (
              <Link
                key={task.href}
                href={task.href}
                className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-zinc-900/70"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-white">{task.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{task.text}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-red-300 transition group-hover:text-red-200">
                  Подробнее
                  <IconArrowRight />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
