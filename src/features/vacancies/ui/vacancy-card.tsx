import Link from "next/link";
import type { Vacancy } from "@/entities/vacancy/vacancy";
import LandingIcon from "@/features/service-landings/ui/icon";
import { employmentLabel, formatSalary, workFormatLabel } from "../lib/vacancy-format";

export default function VacancyCard({ vacancy }: { vacancy: Vacancy }) {
  const format = workFormatLabel(vacancy.workFormat);

  return (
    <Link
      href={`/vacancies/${vacancy.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-600/10 blur-3xl transition-colors group-hover:bg-red-600/15" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
            {vacancy.department || "АВТОWAY"}
          </span>
          {vacancy.isFeatured && (
            <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
              Срочно
            </span>
          )}
        </div>
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-500 transition-all group-hover:border-red-500/40 group-hover:text-red-300">
          <LandingIcon name="arrow-right" className="h-3.5 w-3.5" />
        </span>
      </div>

      <h2 className="relative mt-5 text-xl font-bold tracking-tight text-white transition-colors group-hover:text-red-200">
        {vacancy.title}
      </h2>
      <p className="relative mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-500">
        {vacancy.shortDescription}
      </p>

      <div className="relative mt-5 flex flex-wrap gap-2 text-[11px] text-zinc-500">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 px-2.5 py-1">
          <LandingIcon name="map-pin" className="h-3.5 w-3.5 text-zinc-600" />
          {vacancy.location}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 px-2.5 py-1">
          <LandingIcon name="clock" className="h-3.5 w-3.5 text-zinc-600" />
          {employmentLabel(vacancy.employmentType)}
        </span>
        {format && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/50 px-2.5 py-1">
            <LandingIcon name="users" className="h-3.5 w-3.5 text-zinc-600" />
            {format}
          </span>
        )}
      </div>

      <div className="relative mt-auto flex items-end justify-between gap-4 border-t border-zinc-800/70 pt-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Оплата</p>
          <p className="mt-1 text-sm font-semibold text-amber-300">{formatSalary(vacancy)}</p>
        </div>
        <span className="text-xs font-medium text-zinc-500 transition-colors group-hover:text-white">
          Подробнее
        </span>
      </div>
    </Link>
  );
}
