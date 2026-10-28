"use client";

import type { MouseEvent } from "react";
import { selectService, trackEvent } from "../lib/analytics";
import AutoIcon from "./icon";

type Variant = "primary" | "secondary" | "card";

export default function ServiceCta({
  slug,
  label,
  description,
  meta,
  icon = "arrow-right",
  variant = "primary",
  className = "",
}: {
  slug?: string;
  label: string;
  description?: string;
  meta?: string;
  icon?: string;
  variant?: Variant;
  className?: string;
}) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (slug) {
      trackEvent("tariff_cta_click", { tariff_slug: slug, tariff_title: label });
      selectService(slug);
      return;
    }
    trackEvent("cta_click", { label });
    document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (variant === "card") {
    return (
      <a
        href="#lead"
        onClick={handleClick}
        className={`group flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:-translate-y-0.5 hover:border-zinc-600 hover:bg-zinc-900 ${className}`}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-primary">
          <AutoIcon name={icon} className="h-5 w-5" />
        </div>
        <h3 className="text-base font-semibold text-white">{label}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{description}</p>}
        {meta && <p className="mt-3 text-sm font-medium text-green-400">{meta}</p>}
        <span className="mt-auto flex items-center gap-1.5 pt-5 text-xs font-medium text-primary">
          Выбрать
          <AutoIcon name="arrow-right" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </a>
    );
  }

  const styles =
    variant === "primary"
      ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark"
      : "border border-zinc-700 bg-white/5 text-zinc-200 hover:border-zinc-500 hover:text-white";

  return (
    <a
      href="#lead"
      onClick={handleClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${styles} ${className}`}
    >
      {label}
      <AutoIcon name={icon} className="h-4 w-4" />
    </a>
  );
}
