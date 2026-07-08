"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const CARD_WIDTH = 380;
const GAP = 20;
const STEP = CARD_WIDTH + GAP;

const services = [
  {
    title: "Видео ремонты и обзоры",
    desc: "Смотрю, делаю, показываю. Честные обзоры и живые ремонты без монтажа.",
    href: "https://youtube.com/@avtoway",
    gradient: "from-red-600/20 to-amber-600/10",
    border: "hover:border-red-500/40",
    shadow: "hover:shadow-red-500/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-7"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    ),
  },
  {
    title: "Аренда авто",
    desc: "Авто под такси, просто аренда и подкаты. Прозрачные условия без скрытых платежей.",
    href: "/rent",
    gradient: "from-blue-600/20 to-cyan-600/10",
    border: "hover:border-blue-500/40",
    shadow: "hover:shadow-blue-500/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7"><path d="M8 10h8M6 14h12M3 7l1.5 2.25A2 2 0 0 0 6.25 10h11.5a2 2 0 0 0 1.75-.75L21 7m-9 13v-4m-6 4h12"/></svg>
    ),
  },
  {
    title: "Автоподбор",
    desc: "Проверю авто перед покупкой от и до. Диагностика, документы, торг — полное сопровождение.",
    href: "/inspection",
    gradient: "from-emerald-600/20 to-teal-600/10",
    border: "hover:border-emerald-500/40",
    shadow: "hover:shadow-emerald-500/10",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-7"><path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
    ),
  },
];

export default function ServicesCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const realLen = services.length;
  const allItems = [...services, ...services];
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
    if (isHovered || realLen <= 1) return;
    const timer = setInterval(goNext, 2500);
    return () => clearInterval(timer);
  }, [isHovered, realLen, goNext]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / STEP);
      setCurrent(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
        className="scrollbar-hide -mx-2 flex gap-5 overflow-x-auto px-2 pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allItems.map((service, i) => (
          <a
            key={`${service.title}-${i}`}
            href={service.href}
            target={service.href.startsWith("http") ? "_blank" : undefined}
            rel={service.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className={`group/card snap-start shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${service.gradient} bg-zinc-900/50 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 ${service.border} hover:shadow-xl ${service.shadow}`}
            style={{ width: CARD_WIDTH }}
          >
            <div className="p-7">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-white/5 text-white backdrop-blur-sm transition-transform duration-500 group-hover/card:scale-110 group-hover/card:text-primary">
                {service.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold tracking-tight text-white">
                {service.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                {service.desc}
              </p>
              <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover/card:opacity-100">
                Подробнее
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </a>
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
