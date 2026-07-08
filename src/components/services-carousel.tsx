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

function Card({ service, i, style }: { service: Service; i: number; style?: React.CSSProperties }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const onEnter = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = service.color;
    el.style.boxShadow = `0 20px 60px ${service.color}25, 0 8px 20px rgba(0,0,0,0.4)`;
    el.style.transform = "translateY(-8px)";
    if (barRef.current) barRef.current.style.width = "100%";
    if (iconRef.current) {
      iconRef.current.style.color = service.color;
      iconRef.current.style.background = `linear-gradient(135deg, ${service.color}20, ${service.color}08)`;
    }
  }, [service.color]);

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.borderColor = "#27272a";
    el.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
    el.style.transform = "translateY(0)";
    if (barRef.current) barRef.current.style.width = "0%";
    if (iconRef.current) {
      iconRef.current.style.color = "";
      iconRef.current.style.background = "";
    }
  }, []);

  return (
    <a
      ref={cardRef}
      href={service.href}
      target={service.href.startsWith("http") ? "_blank" : undefined}
      rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="relative shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-lg shadow-black/30 transition-all duration-300"
      style={{ ...style, transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div
        ref={barRef}
        className="absolute left-0 top-0 h-1 rounded-tl-2xl transition-all duration-500"
        style={{ background: service.color, width: "0%" }}
      />

      <div className="relative p-7">
        <div
          ref={iconRef}
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-400 shadow-inner shadow-black/20 transition-all duration-500"
        >
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

  if (!isCarousel) {
    return (
      <div className="flex items-stretch justify-center gap-6">
        {services.map((service, i) => (
          <Card key={service.title} service={service} i={i} style={{ flex: "1", maxWidth: "340px" }} />
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
        {allItems.map((service, i) => (
          <Card key={`${service.title}-${i}`} service={service} i={i} style={{ width: CARD_WIDTH }} />
        ))}
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
