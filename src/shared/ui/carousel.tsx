"use client";

import { type KeyboardEvent, type ReactNode, type TouchEvent, useEffect, useRef, useState } from "react";
import { useCarousel } from "@/shared/lib/hooks/use-carousel";
import { carouselInnerWidth, computeCarouselLayout } from "@/shared/lib/carousel-layout";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/icons";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  cardWidth?: number;
  gap?: number;
  peekWidth?: number;
  autoScroll?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

// Стрелки всегда внутри контейнера: так их не срезает overflow на узких экранах.
const ARROW_BASE =
  "absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 text-white shadow-lg shadow-black/40 backdrop-blur-md transition duration-200 hover:scale-105 hover:border-white/30 hover:bg-zinc-900/90 focus-visible:outline-offset-2 active:scale-95";

const SWIPE_THRESHOLD = 40;

export default function Carousel<T>({
  items,
  renderItem,
  cardWidth = 340,
  gap = 16,
  peekWidth = 60,
  autoScroll,
  showDots = true,
  showArrows = true,
}: CarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const n = items.length;
  const { current, setIsHovered, goNext, goPrev, setCurrent } = useCarousel(n, autoScroll);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) setContainerWidth(Math.round(entry.contentRect.width));
    });
    observer.observe(el);
    setContainerWidth(Math.round(el.getBoundingClientRect().width));
    return () => observer.disconnect();
  }, []);

  const layout = computeCarouselLayout({
    containerWidth,
    totalItems: n,
    cardWidth,
    gap,
    peekWidth,
  });

  const innerWidth = carouselInnerWidth(layout, gap, n);
  // До первого измерения показываем одну карточку во всю ширину, чтобы не было скачка.
  const measuring = containerWidth <= 0;
  const hasPeek = n > 1 && layout.peekWidth > 0 && !measuring;
  const wrap = (i: number) => ((i % n) + n) % n;

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    setIsHovered(true);
  }

  function onTouchEnd(event: TouchEvent) {
    setIsHovered(false);
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || n <= 1) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Только горизонтальный жест: вертикальный скролл страницы не перехватываем.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (n <= 1) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goPrev();
    }
  }

  const elements: ReactNode[] = [];

  if (hasPeek) {
    elements.push(
      <div
        key="peek-l"
        aria-hidden="true"
        inert
        className="relative shrink-0 self-stretch overflow-hidden opacity-45"
        style={{ width: layout.peekWidth }}
      >
        <div
          className="h-full overflow-hidden rounded-r-2xl"
          style={{
            width: layout.cardWidth,
            marginLeft: -(layout.cardWidth - layout.peekWidth),
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
          }}
        >
          {renderItem(items[wrap(current - 1)]!, wrap(current - 1))}
        </div>
      </div>,
    );
  }

  for (let i = 0; i < layout.visible; i++) {
    const idx = wrap(current + i);
    const item = items[idx];
    if (!item) break;
    elements.push(
      <div
        key={`c${i}`}
        className="shrink-0"
        style={measuring ? { width: "100%" } : { width: layout.cardWidth }}
      >
        {renderItem(item, idx)}
      </div>,
    );
  }

  if (hasPeek) {
    elements.push(
      <div
        key="peek-r"
        aria-hidden="true"
        inert
        className="relative shrink-0 self-stretch overflow-hidden opacity-45"
        style={{ width: layout.peekWidth }}
      >
        <div
          className="h-full overflow-hidden rounded-l-2xl"
          style={{
            width: layout.cardWidth,
            WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
            maskImage: "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
          }}
        >
          {renderItem(items[wrap(current + layout.visible)]!, wrap(current + layout.visible))}
        </div>
      </div>,
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-full select-none"
      role={n > 1 ? "group" : undefined}
      aria-roledescription={n > 1 ? "карусель" : undefined}
      aria-label={n > 1 ? "Карусель видео" : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKeyDown}
      tabIndex={n > 1 ? 0 : undefined}
    >
      <div className="relative mx-auto" style={{ maxWidth: innerWidth || undefined }}>
        {showArrows && n > 1 && (
          <button
            type="button"
            onClick={goPrev}
            className={`${ARROW_BASE} left-1 sm:left-2 ${layout.arrowsInside ? "bg-zinc-950/75" : "bg-zinc-950/55"}`}
            aria-label="Предыдущее видео"
          >
            <IconChevronLeft />
          </button>
        )}

        <div className="flex items-stretch py-2" style={{ gap }}>
          {elements}
        </div>

        {showArrows && n > 1 && (
          <button
            type="button"
            onClick={goNext}
            className={`${ARROW_BASE} right-1 sm:right-2 ${layout.arrowsInside ? "bg-zinc-950/75" : "bg-zinc-950/55"}`}
            aria-label="Следующее видео"
          >
            <IconChevronRight />
          </button>
        )}
      </div>

      {showDots && n > 6 ? (
        <div className="relative z-10 mt-5 flex justify-center">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] tabular-nums text-zinc-400">
            {current + 1} / {n}
          </span>
        </div>
      ) : showDots ? (
        <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2 px-12">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-primary shadow-sm shadow-primary/50"
                  : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Видео ${i + 1} из ${n}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
