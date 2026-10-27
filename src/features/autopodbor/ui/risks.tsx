import Reveal from "@/shared/ui/reveal";
import type { AutoPodborFeature } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Risks({ heading, items }: { heading: SectionHeadingData; items: AutoPodborFeature[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 60}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900">
                <span className="absolute inset-y-6 left-0 w-px bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-primary">
                  <AutoIcon name={item.icon} className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-5 sm:flex-row">
            <p className="text-center text-sm font-medium text-zinc-200 sm:text-left">
              Не рискуйте деньгами. Проверьте авто до сделки.
            </p>
            <a
              href="#lead"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Проверить автомобиль
              <AutoIcon name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
