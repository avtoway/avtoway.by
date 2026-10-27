"use client";

import { useState } from "react";
import type { AutoPodborFaq } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { trackEvent } from "../lib/analytics";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Faq({ heading, items }: { heading: SectionHeadingData; items: AutoPodborFaq[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);

  if (items.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading {...heading} />

        <div className="space-y-2">
          {items.map(item => {
            const expanded = open === item.id;
            const panelId = `faq-panel-${item.id}`;
            return (
              <div key={item.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => {
                    const next = expanded ? null : item.id;
                    setOpen(next);
                    if (next) trackEvent("faq_open", { question: item.question });
                  }}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-white transition hover:bg-zinc-900/60 sm:text-base"
                >
                  {item.question}
                  <AutoIcon
                    name="chevron-down"
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded && (
                  <div id={panelId} role="region" className="border-t border-zinc-800/70 px-5 py-4 text-sm leading-relaxed text-zinc-400">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
