import type { AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { tariffPrice } from "../lib/parse";
import SectionHeading from "./section-heading";
import ServiceCta from "./service-cta";

const TASKS = [
  {
    slug: "single-check",
    label: "Проверить авто",
    description: "Авто уже нашли — проверим до сделки.",
    icon: "eye",
  },
  {
    slug: "turnkey",
    label: "Найти под ключ",
    description: "Найдём, проверим и сопроводим сделку.",
    icon: "key",
  },
  {
    slug: "day-expert",
    label: "Эксперт на день",
    description: "Посмотрим несколько вариантов за день.",
    icon: "clock",
  },
];

export default function Quiz({
  heading,
  tariffs,
}: {
  heading: SectionHeadingData;
  tariffs: AutoPodborTariff[];
}) {
  return (
    <section className="border-b border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-3 sm:grid-cols-3">
          {TASKS.map(task => {
            const tariff = tariffs.find(item => item.slug === task.slug);
            const price = tariff ? tariffPrice(tariff) : null;
            const meta = [price, tariff?.duration].filter(Boolean).join(" · ");

            return (
              <ServiceCta
                key={task.slug}
                slug={task.slug}
                label={task.label}
                description={task.description}
                meta={meta || undefined}
                icon={task.icon}
                variant="card"
              />
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Не знаете, что выбрать?{" "}
          <a href="#lead" className="text-primary hover:text-red-400">
            Оставьте заявку
          </a>{" "}
          — подскажем.
        </p>
      </div>
    </section>
  );
}
