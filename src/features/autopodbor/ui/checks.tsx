"use client";

import { useMemo, useState } from "react";
import type { AutoPodborCheckItem } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { CHECK_CATEGORY_LABEL, CHECK_CATEGORY_ORDER } from "../lib/parse";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Checks({
  heading,
  checks,
  equipment,
}: {
  heading: SectionHeadingData;
  checks: AutoPodborCheckItem[];
  equipment?: string;
}) {
  const categories = useMemo(
    () => CHECK_CATEGORY_ORDER.filter(category => checks.some(item => item.category === category)),
    [checks],
  );
  const [active, setActive] = useState(categories[0] ?? "body");
  const items = checks.filter(item => item.category === active);

  if (checks.length === 0) return null;

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <div role="tablist" aria-label="Категории проверки" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {categories.map(category => {
              const count = checks.filter(item => item.category === category).length;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active === category}
                  onClick={() => setActive(category)}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition lg:w-full ${
                    active === category
                      ? "border-primary/40 bg-red-500/10 text-white"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <span>{CHECK_CATEGORY_LABEL[category]}</span>
                  <span className={`text-xs ${active === category ? "text-primary" : "text-zinc-600"}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div role="region" aria-label={CHECK_CATEGORY_LABEL[active]}>
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map(item => (
                <li
                  key={item.id}
                  className="flex items-start gap-2.5 rounded-xl border border-zinc-800/70 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-300"
                >
                  <AutoIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <span>
                    {item.title}
                    {item.isCritical && (
                      <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-amber-400">
                        важно
                      </span>
                    )}
                    {item.description && <span className="mt-0.5 block text-xs text-zinc-500">{item.description}</span>}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4 text-xs text-zinc-400">
              <span className="mb-2 block font-medium text-zinc-300">Оборудование</span>
              {equipment || "Толщиномер · диагностический сканер · эндоскоп · подъёмник · тест-драйв"}
            </div>

            <a
              href="#lead"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Хочу такой отчёт
              <AutoIcon name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
