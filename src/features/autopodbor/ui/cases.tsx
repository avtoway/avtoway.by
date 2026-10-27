"use client";

import { useState } from "react";
import Image from "next/image";
import type { AutoPodborCase } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { pluralDays } from "../lib/parse";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

function usd(value?: number): string | null {
  return value == null ? null : `$${value.toLocaleString("ru-RU")}`;
}

export default function Cases({ heading, items }: { heading: SectionHeadingData; items: AutoPodborCase[] }) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const visible = expanded ? items : items.slice(0, 3);

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(item => {
            const photo = item.mainPhoto || item.photos?.split(",")[0]?.trim();
            const chips = [
              usd(item.budget) && `Бюджет ${usd(item.budget)}`,
              usd(item.purchasePrice) && `Найдено за ${usd(item.purchasePrice)}`,
              usd(item.tradeAmount) && `Торг ${usd(item.tradeAmount)}`,
              item.days != null && pluralDays(item.days),
              item.city,
            ].filter(Boolean) as string[];

            return (
              <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
                <div className="relative aspect-[16/10] bg-zinc-900">
                  {photo ? (
                    <Image src={photo} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_70%)]">
                      <AutoIcon name="car" className="h-16 w-16 text-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  {chips.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {chips.map(chip => (
                        <span key={chip} className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-400">
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <dl className="mt-4 space-y-2 text-xs">
                    {item.task && (
                      <div>
                        <dt className="text-zinc-600">Задача</dt>
                        <dd className="text-zinc-400">{item.task}</dd>
                      </div>
                    )}
                    {item.found && (
                      <div>
                        <dt className="text-zinc-600">Что нашли</dt>
                        <dd className="text-zinc-400">{item.found}</dd>
                      </div>
                    )}
                    {item.result && (
                      <div>
                        <dt className="text-zinc-600">Итог</dt>
                        <dd className="text-zinc-300">{item.result}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </article>
            );
          })}
        </div>

        {items.length > 3 && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setExpanded(value => !value)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-6 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
              {expanded ? "Свернуть" : "Все кейсы"}
              <AutoIcon name="chevron-down" className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
