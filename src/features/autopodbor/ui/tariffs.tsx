"use client";

import { useMemo, useState } from "react";
import type { AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { TARIFF_GROUP_LABEL, parseList, tariffPrice } from "../lib/parse";
import { selectService, trackEvent } from "../lib/analytics";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

const GROUP_ORDER = ["rb", "abroad", "extra"];

export default function Tariffs({
  heading,
  tariffs,
  disclaimer,
}: {
  heading: SectionHeadingData;
  tariffs: AutoPodborTariff[];
  disclaimer?: string;
}) {
  const groups = useMemo(
    () => GROUP_ORDER.filter(group => tariffs.some(t => t.groupName === group)),
    [tariffs],
  );
  const [group, setGroup] = useState(groups[0] ?? "rb");
  const visible = tariffs.filter(t => t.groupName === group);

  if (tariffs.length === 0) return null;

  return (
    <section id="tariffs" className="scroll-mt-24 border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        {groups.length > 1 && (
          <div role="tablist" aria-label="Группы тарифов" className="mx-auto mb-8 flex w-fit flex-wrap justify-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/50 p-1">
            {groups.map(value => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={group === value}
                onClick={() => setGroup(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  group === value ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {TARIFF_GROUP_LABEL[value] ?? value}
              </button>
            ))}
          </div>
        )}

        <div className={`grid gap-4 ${visible.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {visible.map(tariff => {
            const includes = parseList(tariff.includes);
            const price = tariffPrice(tariff);

            return (
              <article
                key={tariff.id}
                className={`relative flex h-full flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  tariff.isPopular
                    ? "border-primary/40 bg-gradient-to-b from-red-500/10 to-zinc-900/40 shadow-xl shadow-red-500/5"
                    : "border-zinc-800 bg-zinc-900/40 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                {tariff.badge && (
                  <span className="mb-3 inline-flex w-fit rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {tariff.badge}
                  </span>
                )}

                <div className="mb-1 flex items-start gap-2">
                  <AutoIcon name={tariff.icon} className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <h3 className="text-lg font-semibold text-white">{tariff.title}</h3>
                </div>

                {price && <p className="mt-2 text-2xl font-bold text-green-400">{price}</p>}
                {tariff.duration && <p className="mt-1 text-xs text-zinc-500">{tariff.duration}</p>}

                {tariff.description && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{tariff.description}</p>
                )}

                {includes.length > 0 && (
                  <ul className="mt-4 flex-1 space-y-2 border-t border-zinc-800/70 pt-4">
                    {includes.map(item => (
                      <li key={item} className="flex items-start gap-2 text-xs text-zinc-400">
                        <AutoIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={() => {
                    trackEvent("tariff_cta_click", { tariff_slug: tariff.slug, tariff_title: tariff.title });
                    selectService(tariff.slug);
                  }}
                  className={`mt-5 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-medium transition ${
                    tariff.isPopular
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-zinc-700 bg-white/5 text-zinc-200 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {tariff.ctaLabel}
                </button>
              </article>
            );
          })}
        </div>

        <div className="mt-8 space-y-2 text-center">
          <p className="text-sm text-zinc-500">Выезд за МКАД — 0,35 BYN/км в обе стороны.</p>
          {disclaimer && <p className="text-xs text-zinc-600">{disclaimer}</p>}
        </div>
      </div>
    </section>
  );
}
