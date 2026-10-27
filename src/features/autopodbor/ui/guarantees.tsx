import type { AutoPodborFeature, AutoPodborSettings } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Guarantees({
  heading,
  advantages,
  guarantees,
  settings,
}: {
  heading: SectionHeadingData;
  advantages: AutoPodborFeature[];
  guarantees: AutoPodborFeature[];
  settings: AutoPodborSettings;
}) {
  if (advantages.length === 0 && guarantees.length === 0) return null;
  const days = settings.guaranteeDays ?? 0;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {advantages.map(item => (
              <div key={item.id} className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                  <AutoIcon name={item.icon} className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                {item.description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>}
              </div>
            ))}
          </div>

          <div className="flex h-full flex-col justify-between rounded-2xl border border-primary/30 bg-gradient-to-b from-red-500/10 to-zinc-900/40 p-7">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Гарантия</p>
              <p className="mt-4 text-5xl font-extrabold tracking-tight text-white">
                {days > 0 ? days : "—"}
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                {days > 0 ? "дней на двигатель и КПП по договору" : "Гарантия условий — в договоре"}
              </p>
            </div>

            {guarantees.length > 0 && (
              <ul className="mt-8 space-y-3 border-t border-zinc-800/80 pt-6">
                {guarantees.map(item => (
                  <li key={item.id} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <AutoIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>
                      <span className="font-medium text-white">{item.title}</span>
                      {item.description && <span className="mt-0.5 block text-xs text-zinc-500">{item.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
