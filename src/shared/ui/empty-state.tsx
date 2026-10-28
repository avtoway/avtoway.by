import Link from "next/link";
import type { ReactNode } from "react";
import { IconArrowRight } from "@/shared/ui/icons";

export type EmptyStateAccent = "red" | "blue" | "emerald" | "amber" | "violet";

export interface EmptyStateAction {
  label: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

export interface EmptyStateFeature {
  title: string;
  text: string;
  icon?: ReactNode;
  href?: string;
}

interface EmptyStateProps {
  badge: string;
  title: ReactNode;
  description: string;
  icon: ReactNode;
  accent?: EmptyStateAccent;
  actions?: EmptyStateAction[];
  features?: EmptyStateFeature[];
  className?: string;
  compact?: boolean;
}

const ACCENTS: Record<EmptyStateAccent, {
  glow: string;
  icon: string;
  badge: string;
  ring: string;
}> = {
  red: {
    glow: "bg-red-600/10",
    icon: "border-red-500/25 bg-red-500/10 text-red-400",
    badge: "border-red-500/20 bg-red-500/10 text-red-300",
    ring: "border-red-500/15",
  },
  blue: {
    glow: "bg-blue-600/10",
    icon: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    ring: "border-blue-500/15",
  },
  emerald: {
    glow: "bg-emerald-600/10",
    icon: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    ring: "border-emerald-500/15",
  },
  amber: {
    glow: "bg-amber-500/10",
    icon: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    ring: "border-amber-500/15",
  },
  violet: {
    glow: "bg-violet-600/10",
    icon: "border-violet-500/25 bg-violet-500/10 text-violet-400",
    badge: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    ring: "border-violet-500/15",
  },
};

function Action({
  action,
  primary,
}: {
  action: EmptyStateAction;
  primary: boolean;
}) {
  const className = primary
    ? "group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20"
    : "inline-flex h-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 px-6 text-sm font-medium text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-700 hover:text-white";

  const content = (
    <>
      {action.label}
      {primary && <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (action.onClick) {
    return (
      <button type="button" onClick={action.onClick} className={className}>
        {content}
      </button>
    );
  }

  if (action.external && action.href) {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  return null;
}

function FeatureCard({ feature }: { feature: EmptyStateFeature }) {
  const className =
    "group flex h-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-900/70";

  const content = (
    <>
      {feature.icon && (
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-zinc-400 transition-colors group-hover:text-white">
          {feature.icon}
        </span>
      )}
      <p className="text-sm font-semibold text-white">{feature.title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{feature.text}</p>
    </>
  );

  if (feature.href) {
    return (
      <Link href={feature.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function EmptyState({
  badge,
  title,
  description,
  icon,
  accent = "red",
  actions = [],
  features = [],
  className = "",
  compact = false,
}: EmptyStateProps) {
  const tone = ACCENTS[accent];

  if (compact) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-5 py-10 text-center ${className}`}>
        <div className={`pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[70px] ${tone.glow}`} />
        <div className="relative">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${tone.icon}`}>
            {icon}
          </span>
          <p className={`mx-auto mt-4 inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tone.badge}`}>
            {badge}
          </p>
          <h3 className="mx-auto mt-4 max-w-md text-xl font-bold text-white">{title}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">{description}</p>
          {actions.length > 0 && (
            <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
              {actions.map((action, index) => (
                <Action key={`${action.label}-${index}`} action={action} primary={index === 0} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <section className={`relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/80 via-zinc-950 to-zinc-950 px-6 py-14 text-center sm:px-10 sm:py-16 ${className}`}>
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/3 rounded-full blur-[100px] ${tone.glow}`} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <div className="relative">
        <div className="relative mx-auto h-28 w-28">
          <div className={`absolute inset-0 rounded-full border ${tone.ring}`} />
          <div className={`absolute inset-4 rounded-full border border-dashed ${tone.ring}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`flex h-16 w-16 items-center justify-center rounded-[1.3rem] border ${tone.icon}`}>
              {icon}
            </span>
          </div>
        </div>

        <p className={`mx-auto mt-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${tone.badge}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {badge}
        </p>

        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          {description}
        </p>

        {actions.length > 0 && (
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {actions.map((action, index) => (
              <Action key={`${action.label}-${index}`} action={action} primary={index === 0} />
            ))}
          </div>
        )}

        {features.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
