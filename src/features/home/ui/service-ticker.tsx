import Link from "next/link";
import { getActiveServices } from "@/shared/lib/active-services.server";

/**
 * Бегущая строка с активными услугами. Данные из БД:
 * скрыли услугу в админке — она исчезает и отсюда.
 */
export default async function ServiceTicker() {
  const services = await getActiveServices();
  if (services.length === 0) return null;

  // Дублируем ряд, чтобы CSS-анимация −50% зацикливалась бесшовно.
  const row = [...services, ...services];

  return (
    <div className="relative overflow-hidden border-y border-zinc-800/60 bg-zinc-950 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-zinc-950 to-transparent sm:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-zinc-950 to-transparent sm:w-28" />
      <div className="animate-marquee flex w-max items-center gap-8 hover:[animation-play-state:paused]">
        {row.map((service, index) => (
          <Link
            key={`${service.slug}-${index}`}
            href={service.href}
            className="group inline-flex shrink-0 items-center gap-2.5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 transition hover:text-white"
          >
            <span
              className="h-1.5 w-1.5 rounded-full transition group-hover:scale-150"
              style={{ backgroundColor: service.color }}
            />
            {service.title}
            <span className="text-zinc-700 transition group-hover:text-red-400" aria-hidden="true">
              ·
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
