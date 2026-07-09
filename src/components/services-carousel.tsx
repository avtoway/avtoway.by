"use client";

import { useState, useCallback, type ReactNode } from "react";
import { IconYouTube, IconCar, IconCheckCircle, IconDollar } from "@/shared/ui/icons";
import Carousel from "@/shared/ui/carousel";

const CARD_WIDTH = 340;
const GAP = 24;

interface ServiceItem {
  title: string;
  desc: string;
  href: string;
  color: string;
}

const serviceIcons: Record<string, ReactNode> = {
  "#ef4444": <IconYouTube />,
  "#3b82f6": <IconCar />,
  "#10b981": <IconCheckCircle />,
  "#f59e0b": <IconDollar />,
};

const colorMap: Record<string, [string, string]> = {
  "#ef4444": ["239,68,68", "rgba(239,68,68,0.15)"],
  "#3b82f6": ["59,130,246", "rgba(59,130,246,0.15)"],
  "#10b981": ["16,185,129", "rgba(16,185,129,0.15)"],
  "#f59e0b": ["245,158,11", "rgba(245,158,11,0.15)"],
};

function Card({ service, onHover, onLeave: onCardLeave }: {
  service: ServiceItem & { icon: ReactNode };
  onHover?: (color: string) => void;
  onLeave?: () => void;
}) {
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
      onMouseLeave={() => onCardLeave?.()}
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

export default function ServicesCarousel({ items = [] }: { items?: ServiceItem[] }) {
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const realLen = items.length;
  const isCarousel = realLen > 3;

  if (realLen === 0) return null;

  const cardHovered = useCallback((color: string) => setHoverColor(color), []);
  const cardLeft = useCallback(() => setHoverColor(null), []);

  const color = hoverColor ? colorMap[hoverColor] : null;

  return (
    <section
      id="services"
      className="relative border-t border-zinc-800/50 bg-zinc-950 py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: color
            ? `radial-gradient(ellipse 80% 60% at 50% 40%, ${color[1]} 0%, transparent 70%)`
            : "none",
          opacity: color ? 1 : 0,
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-gradient rounded-full blur-[100px] transition-all duration-700"
          style={{
            background: color
              ? `radial-gradient(circle, ${color[1]}, transparent 70%)`
              : "radial-gradient(circle, rgba(239,68,68,0.04), transparent 70%)",
            opacity: color ? 0.6 : 0.3,
          }}
        />
        <div
          className="absolute -bottom-40 right-20 h-[400px] w-[400px] animate-gradient rounded-full blur-[100px] transition-all duration-700"
          style={{
            animationDelay: "-7s",
            background: color
              ? `radial-gradient(circle, ${color[1]}, transparent 70%)`
              : "radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)",
            opacity: color ? 0.6 : 0.3,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-gradient rounded-full blur-[80px] transition-all duration-700"
          style={{
            animationDelay: "-3.5s",
            background: color
              ? `radial-gradient(circle, ${color[1]}, transparent 70%)`
              : "transparent",
            opacity: color ? 0.4 : 0,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center opacity-0 animate-reveal revealed">
          <h2 className="text-3xl font-bold text-white">
            Наши услуги
          </h2>
        </div>

        {!isCarousel ? (
          <div className="flex items-stretch justify-center gap-6 pt-3">
            {items.map((item) => (
              <div key={item.title} className="flex-1 max-w-[340px]">
                <Card service={{ ...item, icon: serviceIcons[item.color] }} onHover={cardHovered} onLeave={cardLeft} />
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            items={items}
            cardWidth={CARD_WIDTH}
            gap={GAP}
            autoScroll={2500}
            renderItem={(item) => (
              <Card service={{ ...item, icon: serviceIcons[item.color] }} onHover={cardHovered} onLeave={cardLeft} />
            )}
          />
        )}
      </div>
    </section>
  );
}
