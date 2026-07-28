"use client";

import { type ReactNode, useRef, useEffect, useState } from "react";
import { useCarousel } from "@/shared/lib/hooks/use-carousel";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/icons";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  cardWidth?: number;
  gap?: number;
  autoScroll?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export default function Carousel<T>({
  items,
  renderItem,
  cardWidth = 340,
  gap = 16,
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
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const CARD_STEP = cardWidth + gap;
  const ARROW_MARGIN = 44;

  let visible = 2;
  if (containerWidth >= ARROW_MARGIN * 2 + CARD_STEP * 4) visible = 4;
  else if (containerWidth >= ARROW_MARGIN * 2 + CARD_STEP * 3) visible = 3;
  visible = Math.min(visible, n);

  const wrap = (i: number) => ((i % n) + n) % n;
  const trackWidth = visible * CARD_STEP - gap;

  const cards: ReactNode[] = [];
  for (let i = 0; i < visible; i++) {
    const idx = wrap(current + i);
    const item = items[idx];
    if (!item) break;
    cards.push(
      <div key={i} className="shrink-0" style={{ width: cardWidth }}>
        {renderItem(item, idx)}
      </div>
    );
  }

  const arrowBtn =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800";

  return (
    <div
      ref={containerRef}
      className="relative select-none mx-auto w-full max-w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto relative" style={{ maxWidth: trackWidth }}>
        {showArrows && (
          <button onClick={goPrev} className={arrowBtn} aria-label="Назад" style={{ left: -ARROW_MARGIN }}>
            <IconChevronLeft />
          </button>
        )}

        <div className="flex items-center" style={{ gap }}>
          {cards}
        </div>

        {showArrows && (
          <button onClick={goNext} className={arrowBtn} aria-label="Вперёд" style={{ right: -ARROW_MARGIN }}>
            <IconChevronRight />
          </button>
        )}
      </div>

      {showDots && (
        <div className="relative z-10 mt-6 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? "w-6 bg-primary shadow-sm shadow-primary/50"
                  : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Элемент ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
