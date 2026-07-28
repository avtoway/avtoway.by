"use client";

import { type ReactNode } from "react";
import { useCarousel } from "@/shared/lib/hooks/use-carousel";
import { IconChevronLeft, IconChevronRight } from "@/shared/ui/icons";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  cardWidth?: number;
  gap?: number;
  peekWidth?: number;
  visibleCards?: number;
  autoScroll?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export default function Carousel<T>({
  items,
  renderItem,
  cardWidth = 340,
  gap = 24,
  peekWidth = 80,
  visibleCards = 3,
  autoScroll,
  showDots = true,
  showArrows = true,
}: CarouselProps<T>) {
  const n = items.length;
  const { current, setIsHovered, goNext, goPrev, setCurrent } =
    useCarousel(n, autoScroll);

  const wrap = (i: number) => ((i % n) + n) % n;

  const visible = n > visibleCards ? visibleCards : n;
  const cards: ReactNode[] = [];
  for (let i = 0; i < visible + 2; i++) {
    const idx = wrap(current - 1 + i);
    const item = items[idx];
    if (!item) break;
    if (i === 0 || i === visible + 1) {
      cards.push(
        <div key={i === 0 ? "prev" : "next"} className="relative shrink-0">
          <div
            className="overflow-hidden h-full"
            style={{
              width: peekWidth,
              WebkitMaskImage: i === 0
                ? "linear-gradient(to right, transparent 0%, black 30%, black 100%)"
                : "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
              maskImage: i === 0
                ? "linear-gradient(to right, transparent 0%, black 30%, black 100%)"
                : "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
              borderRadius: i === 0 ? "0 1rem 1rem 0" : "1rem 0 0 1rem",
            }}
          >
            <div className="h-full" style={{ width: cardWidth, marginLeft: i === 0 ? -(cardWidth - peekWidth) : 0 }}>
              {renderItem(item, idx)}
            </div>
          </div>
        </div>
      );
    } else {
      cards.push(
        <div key={`card-${i}`} className="shrink-0" style={{ width: cardWidth }}>
          {renderItem(item, idx)}
        </div>
      );
    }
  }

  const fullWidth = visible * cardWidth + (visible - 1) * gap;
  const totalWidth = fullWidth + 2 * peekWidth + 2 * gap;

  return (
    <div
      className="relative select-none mx-auto"
      style={{ maxWidth: totalWidth + 120 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showArrows && (
        <button
          onClick={goPrev}
          className="absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
          aria-label="Назад"
          style={{ left: -60 }}
        >
          <IconChevronLeft />
        </button>
      )}

      <div className="mx-auto" style={{ maxWidth: totalWidth }}>
        <div className="flex items-center" style={{ gap }}>
          {cards}
        </div>
      </div>

      {showArrows && (
        <button
          onClick={goNext}
          className="absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800 sm:flex"
          aria-label="Вперёд"
          style={{ right: -60 }}
        >
          <IconChevronRight />
        </button>
      )}

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
