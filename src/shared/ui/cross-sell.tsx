import "@/di/composition-root";
import { cache } from "react";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import Link from "next/link";
import { IconArrowRight } from "@/shared/ui/icons";

const loadServices = cache(async () => {
  try {
    return await container.get<ServiceRepository>("ServiceRepository").getActive();
  } catch {
    return [];
  }
});

/**
 * Кросс-продажи: блок «другие услуги» на страницах услуг и карточках авто.
 * Исключает текущую услугу и показывает до трёх остальных.
 */
export default async function CrossSell({
  exclude,
  title = "Другие услуги АВТОWAY",
  limit = 3,
}: {
  exclude?: string;
  title?: string;
  limit?: number;
}) {
  const services = (await loadServices())
    .filter(service => service.slug !== exclude)
    .slice(0, limit);

  if (services.length === 0) return null;

  return (
    <section className="border-t border-zinc-800/60 bg-zinc-950 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
          <Link href="/services" className="text-xs text-red-300 transition hover:text-red-200">
            Все услуги →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Link
              key={service.slug}
              href={service.href}
              className="group flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-red-500/40 hover:bg-zinc-900/70"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{service.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">{service.desc}</p>
              </div>
              <span className="mt-0.5 shrink-0 text-zinc-600 transition group-hover:text-red-300">
                <IconArrowRight />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
