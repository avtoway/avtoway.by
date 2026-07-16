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
  autoScroll?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export default function Carousel<T>({
  items,
  renderItem,
  cardWidth = 340,
  gap = 24,
  peekWidth = 64,
  autoScroll,
  showDots = true,
  showArrows = true,
}: CarouselProps<T>) {
  const n = items.length;
  const { current, setIsHovered, goNext, goPrev, setCurrent } =
    useCarousel(n, autoScroll);

  const wrap = (i: number) => ((i % n) + n) % n;

  const peekLeft = items[wrap(current - 1)]!;
  const card0 = items[wrap(current)]!;
  const card1 = items[wrap(current + 1)]!;
  const card2 = items[wrap(current + 2)]!;
  const peekRight = items[wrap(current + 3)]!;

  const viewportWidth = 2 * peekWidth + 3 * cardWidth + 4 * gap;

  return (
    <div
      className="relative select-none mx-auto"
      style={{ width: viewportWidth, maxWidth: "calc(100vw - 144px)" }}
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

      <div className="flex" style={{ gap }}>
        <div
          className="shrink-0 overflow-hidden relative rounded-r-2xl"
          style={{
            width: peekWidth,
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
            maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 100%)",
          }}
        >
          <div className="h-full" style={{ width: cardWidth, marginLeft: -(cardWidth - peekWidth) }}>
            {renderItem(peekLeft, wrap(current - 1))}
          </div>
        </div>

        <div className="shrink-0" style={{ width: cardWidth }}>
          {renderItem(card0, wrap(current))}
        </div>
        <div className="shrink-0" style={{ width: cardWidth }}>
          {renderItem(card1, wrap(current + 1))}
        </div>
        <div className="shrink-0" style={{ width: cardWidth }}>
          {renderItem(card2, wrap(current + 2))}
        </div>

        <div
          className="shrink-0 overflow-hidden relative rounded-l-2xl"
          style={{
            width: peekWidth,
            WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 20%, black 100%)",
            maskImage: "linear-gradient(to left, transparent 0%, black 20%, black 100%)",
          }}
        >
          <div className="h-full" style={{ width: cardWidth }}>
            {renderItem(peekRight, wrap(current + 3))}
          </div>
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
