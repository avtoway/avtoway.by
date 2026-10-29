import type { ReactNode } from "react";
import PageBreadcrumbs, { type BreadcrumbItem } from "@/shared/ui/page-breadcrumbs";
import LandingIcon from "./icon";
import { ACCENTS, type LandingAccent } from "./landing-ui";

export interface LandingHeroProps {
  badge: string;
  title: ReactNode;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  phone?: string | null;
  stats: Array<{ value: string; label: string }>;
  chips: string[];
  icon: string;
  accent?: LandingAccent;
  breadcrumbs: BreadcrumbItem[];
  visualLabel?: string;
  statusLabel?: string;
}

export default function LandingHero({
  badge,
  title,
  subtitle,
  primaryLabel,
  secondaryLabel,
  secondaryHref,
  phone,
  stats,
  chips,
  icon,
  accent = "red",
  breadcrumbs,
  visualLabel = "Сервис АВТОWAY",
  statusLabel = "На связи",
}: LandingHeroProps) {
  const tone = ACCENTS[accent];
  const secondary = secondaryHref ?? (phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "/contacts");

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/60 pb-16 pt-28 sm:pb-20">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -right-32 -top-40 h-[500px] w-[500px] rounded-full blur-[130px] ${tone.glow}`} />
        <div className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-zinc-700/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <PageBreadcrumbs items={breadcrumbs} className="mb-8" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14">
          <div className="max-w-2xl">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge}`}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              {badge}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-[1.04] tracking-tight text-white sm:text-5xl xl:text-6xl">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-primary/30"
              >
                {primaryLabel}
                <LandingIcon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href={secondary}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-7 text-sm font-medium text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-500 hover:text-white"
              >
                <LandingIcon name={secondary.startsWith("tel:") ? "phone" : "arrow-right"} className="h-4 w-4" />
                {secondaryLabel ?? (secondary.startsWith("tel:") ? "Позвонить" : "Узнать больше")}
              </a>
            </div>

            <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-zinc-800/80 pt-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl font-bold tracking-tight text-white sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-[11px] leading-snug text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[16/12] overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-5 shadow-2xl shadow-black/30">
              <div className={`pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-[80px] ${tone.glow}`} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.04),transparent_55%)]" />

              <div className="relative flex items-center justify-between">
                <span className="rounded-full border border-zinc-700/70 bg-zinc-950/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-400 backdrop-blur-sm">
                  {visualLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-medium text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {statusLabel}
                </span>
              </div>

              <div className="relative flex h-[calc(100%-3rem)] items-center justify-center">
                <div className="relative flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
                  <div className={`absolute inset-0 rounded-full border ${tone.badge}`} />
                  <div className={`absolute inset-5 rounded-full border border-dashed ${tone.badge} animate-[float-shape_26s_linear_infinite]`} />
                  <div className={`absolute inset-10 rounded-full blur-xl ${tone.glow}`} />
                  <div className={`relative flex h-24 w-24 items-center justify-center rounded-[1.8rem] border shadow-2xl shadow-black/30 ${tone.icon}`}>
                    <LandingIcon name={icon} className="h-11 w-11" />
                  </div>
                </div>
              </div>

              <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5">
                {chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-zinc-700/70 bg-zinc-950/80 px-2.5 py-1 text-[10px] text-zinc-400 backdrop-blur-sm">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
