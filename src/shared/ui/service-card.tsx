"use client";

import type { ReactNode } from "react";

interface ServiceCardItem {
  title: string;
  desc: string;
  href: string;
  color: string;
}

interface ServiceCardProps {
  service: ServiceCardItem & { icon: ReactNode };
  onHover?: (color: string) => void;
  onLeave?: () => void;
}

export default function ServiceCard({ service, onHover, onLeave }: ServiceCardProps) {
  return (
    <a
      href={service.href}
      target={service.href.startsWith("http") ? "_blank" : undefined}
      rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group relative block h-full w-full rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/30 transition-all duration-300 hover:border-[var(--card-color)] hover:shadow-[0_20px_60px_var(--card-shadow),0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1.5 hover:scale-[1.02]"
      style={{
        "--card-color": service.color,
        "--card-shadow": `${service.color}40`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      } as React.CSSProperties}
      onMouseEnter={() => onHover?.(service.color)}
      onMouseLeave={() => onLeave?.()}
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />
        <div
          className="absolute left-0 top-0 h-1 rounded-t-2xl transition-all duration-500 w-0 group-hover:w-full group-hover:shadow-[0_0_12px_var(--card-color)]"
          style={{ background: service.color }}
        />
      </div>

      <div className="relative p-7">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 shadow-inner shadow-black/20 transition-all duration-500 group-hover:text-[var(--card-color)] group-hover:scale-110">
          {service.icon}
        </div>

        <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
          {service.title}
        </h3>

        <p className="text-sm leading-relaxed text-zinc-400">
          {service.desc}
        </p>
      </div>
    </a>
  );
}
