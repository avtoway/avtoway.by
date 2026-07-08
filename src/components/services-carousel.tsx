"use client";

import { useRef, useState, useEffect, useCallback, type ReactNode } from "react";

const CARD_WIDTH = 340;
const GAP = 24;
const STEP = CARD_WIDTH + GAP;

interface Service {
  title: string;
  desc: string;
  href: string;
  color: string;
  icon: ReactNode;
}

const services: Service[] = [
  {
    title: "Видео ремонты и обзоры",
    desc: "Честные обзоры и живые ремонты без монтажа.",
    href: "https://youtube.com/@avtoway",
    color: "#ef4444",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    title: "Аренда авто",
    desc: "Авто под такси, просто аренда и подкаты. Без скрытых платежей.",
    href: "/rent",
    color: "#3b82f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6"><path d="M8 10h8M6 14h12M3 7l1.5 2.25A2 2 0 0 0 6.25 10h11.5a2 2 0 0 0 1.75-.75L21 7m-9 13v-4m-6 4h12"/></svg>
    ),
  },
  {
    title: "Автоподбор",
    desc: "Проверю авто перед покупкой. Диагностика, документы, торг.",
    href: "/inspection",
    color: "#10b981",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
    ),
  },
  {
    title: "Продажа авто",
    desc: "Помогу продать вашу машину быстро и без головной боли.",
    href: "/sell",
    color: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
    ),
  },
];

export default function ServicesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const realLen = services.length;
  const isCarousel = realLen > 3;

  const allItems = isCarousel ? [...services, ...services] : services;
  const maxIndex = allItems.length - 1;

  const scrollTo = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      scrollRef.current?.scrollTo({ left: index * STEP, behavior });
      setCurrent(index);
    },
    [],
  );

  const goNext = useCallback(() => {
    const next = current + 1;
    if (next > maxIndex) scrollTo(0, "instant");
    else scrollTo(next);
  }, [current, maxIndex, scrollTo]);

  const goPrev = useCallback(() => {
    const prev = current - 1;
    if (prev < 0) scrollTo(maxIndex, "instant");
    else scrollTo(prev);
  }, [current, maxIndex, scrollTo]);

  useEffect(() => {
    if (!isCarousel || isHovered || realLen <= 1) return;
    const timer = setInterval(goNext, 2500);
    return () => clearInterval(timer);
  }, [isCarousel, isHovered, realLen, goNext]);

  useEffect(() => {
    if (!isCarousel) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / STEP);
      setCurrent(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [isCarousel]);

  const renderCard = (service: Service, i: number) => (
    <a
      key={`${service.title}-${i}`}
      href={service.href}
      target={service.href.startsWith("http") ? "_blank" : undefined}
      rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group/card snap-start shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
      style={
        isCarousel
          ? { width: CARD_WIDTH, "--c": service.color } as React.CSSProperties
          : { "--c": service.color } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div
        className="absolute left-0 top-0 h-1 w-0 rounded-tl-2xl transition-all duration-500 group-hover/card:w-full"
        style={{ background: service.color }}
      />

      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top right, ${service.color}20 0%, transparent 70%)`,
        }}
      />

      <div className="relative p-7">
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 shadow-inner shadow-black/20 transition-all duration-500 group-hover/card:scale-110 group-hover/card:bg-zinc-800/50 group-hover/card:shadow-xl"
          style={{ transitionProperty: "transform, background, color, box-shadow" }}
        >
          <div className="transition-colors duration-500 group-hover/card:text-[var(--c)]">
            {service.icon}
          </div>
        </div>

        <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
          {service.title}
        </h3>

        <p className="text-sm leading-relaxed text-zinc-400 transition-colors duration-300 group-hover/card:text-zinc-300">
          {service.desc}
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-all duration-300 group-hover/card:gap-3 group-hover/card:text-[var(--c)]">
          Подробнее
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-300 group-hover/card:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </div>
      </div>
    </a>
  );

  if (!isCarousel) {
    return (
      <div className="flex items-stretch justify-center gap-6">
        {services.map((service, i) => (
          <div key={service.title} className="flex-1 max-w-[340px]">
            {renderCard(service, i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={goPrev}
        className="absolute -left-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
        aria-label="Назад"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-2 flex gap-6 overflow-x-auto px-2 pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allItems.map((service, i) => renderCard(service, i))}
      </div>

      <button
        onClick={goNext}
        className="absolute -right-3 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
        aria-label="Вперёд"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div className="relative z-10 mt-6 flex justify-center gap-2">
        {services.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === current % realLen
                ? "w-6 bg-primary shadow-sm shadow-primary/50"
                : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
            }`}
            aria-label={`Услуга ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
