import Link from "next/link";
import {
  IconArrowRight,
  IconBoxes,
  IconCar,
  IconCheckCircle,
  IconDollar,
  IconWrench,
} from "@/shared/ui/icons";
import { getActiveServices } from "@/shared/lib/active-services.server";

/**
 * Карточки задач для главной. Ключ — slug услуги из БД.
 * Показываем ровно те услуги, которые включены в админке.
 */
const SERVICE_TASKS: Record<
  string,
  { title: string; text: string; href: string; icon: typeof IconCar }
> = {
  rent: {
    title: "Нужна машина на время",
    text: "Аренда по дням и неделям, в том числе под такси. Прозрачные цены и залог.",
    href: "/services/rent",
    icon: IconCar,
  },
  sell: {
    title: "Продать авто выгодно",
    text: "Поможем продать или принять авто в зачёт. Проверка и реклама включены.",
    href: "/services/sell",
    icon: IconDollar,
  },
  inspection: {
    title: "Проверить или купить авто",
    text: "Автоподбор и осмотр перед покупкой: кузов, техника, документы, торг.",
    href: "/services/inspection",
    icon: IconCheckCircle,
  },
  truck: {
    title: "Эвакуатор",
    text: "Эвакуация авто 24/7 по Минску и Беларуси. Быстро и аккуратно.",
    href: "/services/truck",
    icon: IconBoxes,
  },
  moving: {
    title: "Грузоперевозки",
    text: "Квартирные и офисные переезды, грузовое такси, перевозка мебели и оборудования.",
    href: "/services/moving",
    icon: IconBoxes,
  },
  import: {
    title: "Пригнать авто",
    text: "Подбор и доставка авто из США, Европы, Кореи и Китая под ключ.",
    href: "/services/import",
    icon: IconCar,
  },
  service: {
    title: "Автосервис",
    text: "Ремонт и обслуживание автомобилей любой сложности.",
    href: "/services/service",
    icon: IconWrench,
  },
};

export default async function TaskSection() {
  const services = await getActiveServices();
  const visibleTasks = services.map(service => ({
    title: service.title,
    text: service.desc || "Подробнее об услуге на отдельной странице.",
    href: service.href,
    icon: IconCar,
    ...(SERVICE_TASKS[service.slug] ?? {}),
  }));

  if (visibleTasks.length === 0) return null;

  const gridClass =
    visibleTasks.length === 1
      ? "lg:grid-cols-1"
      : visibleTasks.length === 2
        ? "lg:grid-cols-2"
        : visibleTasks.length === 3
          ? "lg:grid-cols-3"
          : visibleTasks.length === 4
            ? "lg:grid-cols-4"
            : "lg:grid-cols-3";

  return (
    <section id="tasks" className="border-b border-zinc-800/60 bg-zinc-950 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-9 max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            С чего начнём
          </span>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Выберите задачу — мы сделаем остальное</h2>
          <p className="mt-3 text-base leading-relaxed text-zinc-400">
            Один подрядчик: {services.map(service => service.title).join(" · ")}.
          </p>
        </div>

        <div className={`grid gap-4 sm:grid-cols-2 ${gridClass}`}>
          {visibleTasks.map(task => {
            const Icon = task.icon;
            return (
              <Link
                key={task.href}
                href={task.href}
                className="group animate-card-sheen relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:bg-zinc-900/70 hover:shadow-2xl hover:shadow-red-950/20"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition duration-300 group-hover:scale-110 group-hover:border-red-500/40 group-hover:bg-red-500/15">
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
