import Reveal from "@/shared/ui/reveal";
import type { AutoPodborCity } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Geography({ heading, cities }: { heading: SectionHeadingData; cities: AutoPodborCity[] }) {
  if (cities.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <Reveal>
          <div className="flex flex-wrap justify-center gap-2.5">
            {cities.map(city => (
              <span
                key={city.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white"
              >
                <AutoIcon name="map-pin" className="h-4 w-4 text-primary/80" />
                {city.name}
              </span>
            ))}
          </div>
        </Reveal>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Не нашли свой город?{" "}
          <a href="#lead" className="text-primary hover:text-red-400">
            Напишите
          </a>{" "}
          — уточним выезд.
        </p>
      </div>
    </section>
  );
}
