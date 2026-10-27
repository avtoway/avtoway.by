import Reveal from "@/shared/ui/reveal";
import type { AutoPodborStep } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Process({ heading, steps }: { heading: SectionHeadingData; steps: AutoPodborStep[] }) {
  if (steps.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Reveal key={step.id} delay={index * 50}>
              <li className="relative h-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-3xl font-extrabold tracking-tight text-zinc-700">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <AutoIcon name={step.icon} className="h-5 w-5 text-primary/80" />
                </div>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                {step.duration && (
                  <span className="mt-2 inline-flex rounded-full bg-zinc-800/80 px-2.5 py-0.5 text-[11px] text-zinc-400">
                    {step.duration}
                  </span>
                )}
                {step.description && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                )}
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
