import type { AutoPodborFeature } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";
import ServiceCta from "./service-cta";

export default function Risks({ heading, items }: { heading: SectionHeadingData; items: AutoPodborFeature[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(item => (
            <div
              key={item.id}
              className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
            >
              <span className="absolute inset-y-6 left-0 w-px bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-primary">
                <AutoIcon name={item.icon} className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-white">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-5 sm:flex-row">
          <p className="text-center text-sm font-medium text-zinc-200 sm:text-left">
            Не рискуйте деньгами. Проверьте авто до сделки.
          </p>
          <ServiceCta
            slug="single-check"
            label="Проверить авто до покупки"
            variant="primary"
            className="shrink-0"
          />
        </div>
      </div>
    </section>
  );
}
