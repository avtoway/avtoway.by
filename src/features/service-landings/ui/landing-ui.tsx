import type { ReactNode } from "react";
import Reveal from "@/shared/ui/reveal";
import LandingIcon from "./icon";

export type LandingAccent = "red" | "blue" | "amber" | "emerald";

export const ACCENTS: Record<LandingAccent, { icon: string; badge: string; glow: string; line: string }> = {
  red: {
    icon: "border-red-500/25 bg-red-500/10 text-red-400",
    badge: "border-red-500/20 bg-red-500/10 text-red-300",
    glow: "bg-red-600/10",
    line: "from-red-500/60",
  },
  blue: {
    icon: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    glow: "bg-blue-600/10",
    line: "from-blue-500/60",
  },
  amber: {
    icon: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    glow: "bg-amber-500/10",
    line: "from-amber-500/60",
  },
  emerald: {
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    glow: "bg-emerald-600/10",
    line: "from-emerald-500/60",
  },
};

export function LandingSection({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`relative mx-auto max-w-6xl scroll-mt-24 px-6 py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  );
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  accent = "red",
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  accent?: LandingAccent;
}) {
  const tone = ACCENTS[accent];
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {badge && (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className={`mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base ${align === "center" ? "mx-auto max-w-xl" : "max-w-xl"}`}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function FeatureGrid({
  items,
  accent = "red",
  columns = 3,
}: {
  items: Array<{ icon: string; title: string; text: string }>;
  accent?: LandingAccent;
  columns?: 2 | 3 | 4;
}) {
  const tone = ACCENTS[accent];
  const grid = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={`mt-10 grid gap-4 ${grid}`}>
      {items.map((item, index) => (
        <Reveal key={item.title} delay={index * 45}>
          <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.02] blur-2xl transition-colors group-hover:bg-white/[0.05]" />
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone.icon}`}>
              <LandingIcon name={item.icon} className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.text}</p>
          </article>
        </Reveal>
      ))}
    </div>
  );
}

export function Steps({
  items,
  accent = "red",
  columns = 4,
}: {
  items: Array<{ title: string; text: string; meta?: string }>;
  accent?: LandingAccent;
  columns?: 3 | 4 | 5;
}) {
  const tone = ACCENTS[accent];
  const grid = {
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
  }[columns];
  const line = {
    3: "left-[16.6%] right-[16.6%]",
    4: "left-[12.5%] right-[12.5%]",
    5: "left-[10%] right-[10%]",
  }[columns];

  return (
    <div className={`relative mt-10 grid gap-4 ${grid}`}>
      <div className={`pointer-events-none absolute ${line} top-7 hidden h-px bg-gradient-to-r ${tone.line} via-zinc-800 to-transparent lg:block`} />
      {items.map((item, index) => (
        <Reveal key={item.title} delay={index * 70}>
          <div className="relative h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${tone.icon}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.meta && <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-600">{item.meta}</span>}
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function PriceGrid({
  items,
  note,
  accent = "red",
}: {
  items: Array<{ title: string; price: string; unit?: string; note?: string; badge?: string }>;
  note?: string;
  accent?: LandingAccent;
}) {
  const tone = ACCENTS[accent];
  return (
    <div className="mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={`${item.title}-${index}`} delay={index * 45}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
              {item.badge && (
                <span className={`absolute right-4 top-4 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider ${tone.badge}`}>
                  {item.badge}
                </span>
              )}
              <p className="max-w-[80%] text-sm font-medium text-zinc-400">{item.title}</p>
              <div className="mt-4 flex flex-wrap items-baseline gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-white">{item.price}</span>
                {item.unit && <span className="text-xs text-zinc-500">{item.unit}</span>}
              </div>
              {item.note && <p className="mt-3 text-xs leading-relaxed text-zinc-600">{item.note}</p>}
            </div>
          </Reveal>
        ))}
      </div>
      {note && <p className="mt-5 text-xs leading-relaxed text-zinc-600">{note}</p>}
    </div>
  );
}

export function Faq({
  items,
  accent = "red",
}: {
  items: Array<{ question: string; answer: string }>;
  accent?: LandingAccent;
}) {
  const tone = ACCENTS[accent];
  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-3">
      {items.map((item, index) => (
        <Reveal key={item.question} delay={index * 35}>
          <details className="group rounded-2xl border border-zinc-800/80 bg-zinc-900/40 transition-colors open:border-zinc-700 open:bg-zinc-900/70">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-zinc-200 marker:hidden">
              <span>{item.question}</span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${tone.icon} transition-transform group-open:rotate-180`}>
                <LandingIcon name="chevron-down" className="h-3.5 w-3.5" />
              </span>
            </summary>
            <p className="border-t border-zinc-800/70 px-5 py-4 text-sm leading-relaxed text-zinc-500">{item.answer}</p>
          </details>
        </Reveal>
      ))}
    </div>
  );
}

export function CtaBand({
  title,
  text,
  primaryLabel = "Оставить заявку",
  primaryHref = "#lead",
  phone,
  accent = "red",
}: {
  title: string;
  text: string;
  primaryLabel?: string;
  primaryHref?: string;
  phone?: string | null;
  accent?: LandingAccent;
}) {
  const tone = ACCENTS[accent];
  return (
    <LandingSection className="pb-8">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-10">
        <div className={`pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-[100px] ${tone.glow}`} />
        <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">АВТОWAY</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
            <a
              href={primaryHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20"
            >
              {primaryLabel}
              <LandingIcon name="arrow-right" className="h-4 w-4" />
            </a>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 px-6 text-sm font-medium text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:text-white"
              >
                {phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}

export function StickyCta({
  phone,
  formLabel = "Заявка",
}: {
  phone?: string | null;
  formLabel?: string;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md gap-2">
        {phone && (
          <a
            href={`tel:${phone.replace(/[^\d+]/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-medium text-white"
          >
            <LandingIcon name="phone" className="h-4 w-4 text-primary" />
            Позвонить
          </a>
        )}
        <a
          href="#lead"
          className="flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
        >
          {formLabel}
        </a>
      </div>
    </div>
  );
}

export function DirectionCard({
  country,
  flag,
  text,
  meta,
  accent = "blue",
}: {
  country: string;
  flag: string;
  text: string;
  meta: string;
  accent?: LandingAccent;
}) {
  const tone = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl ${tone.glow}`} />
      <span className="text-2xl" aria-hidden="true">{flag}</span>
      <h3 className="mt-3 text-base font-semibold text-white">{country}</h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">{text}</p>
      <p className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${tone.badge}`}>{meta}</p>
    </div>
  );
}


