"use client";

import { type ReactNode, useRef, useEffect, useState } from "react";
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
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const CARD_STEP = cardWidth + gap;
  const ARROW_GAP = 12;

  let fullVisible = 2;
  const available = containerWidth - 2 * peekWidth;
  if (available >= CARD_STEP * 4) fullVisible = 4;
  else if (available >= CARD_STEP * 3) fullVisible = 3;
  else if (available >= CARD_STEP * 2) fullVisible = 2;
  fullVisible = Math.min(fullVisible, n);

  const wrap = (i: number) => ((i % n) + n) % n;

  const elements: ReactNode[] = [];

  // Previous peek
  if (n > 1) {
    elements.push(
      <div key="peek-l" className="shrink-0 relative" style={{ width: peekWidth }}>
        <div className="h-full overflow-hidden rounded-r-2xl" style={{
          width: cardWidth,
          marginLeft: -(cardWidth - peekWidth),
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 30%, black 100%)",
        }}>
          {renderItem(items[wrap(current - 1)]!, wrap(current - 1))}
        </div>
      </div>
    );
  }

  // Full cards
  for (let i = 0; i < fullVisible; i++) {
    const idx = wrap(current + i);
    const item = items[idx];
    if (!item) break;
    elements.push(
      <div key={`c${i}`} className="shrink-0" style={{ width: cardWidth }}>
        {renderItem(item, idx)}
      </div>
    );
  }

  // Next peek
  if (n > 1) {
    elements.push(
      <div key="peek-r" className="shrink-0 relative" style={{ width: peekWidth }}>
        <div className="h-full overflow-hidden rounded-l-2xl" style={{
          width: cardWidth,
          WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
          maskImage: "linear-gradient(to left, transparent 0%, black 30%, black 100%)",
        }}>
          {renderItem(items[wrap(current + fullVisible)]!, wrap(current + fullVisible))}
        </div>
      </div>
    );
  }

  const hasLeftPeek = n > 1;
  const hasRightPeek = n > 1;
  const innerWidth = (hasLeftPeek ? peekWidth : 0)
    + fullVisible * cardWidth
    + (hasRightPeek ? peekWidth : 0)
    + (hasLeftPeek ? gap : 0)
    + (fullVisible - 1) * gap
    + (hasRightPeek ? gap : 0);

  const arrowBtn =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-900/80 text-zinc-300 shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:border-white/20 hover:bg-zinc-800";

  return (
    <div
      ref={containerRef}
      className="relative select-none mx-auto w-full max-w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto relative" style={{ maxWidth: innerWidth }}>
        {showArrows && n > 1 && (
          <button onClick={goPrev} className={arrowBtn} aria-label="Назад" style={{ left: -ARROW_GAP }}>
            <IconChevronLeft />
          </button>
        )}

        <div className="flex items-center" style={{ gap }}>
          {elements}
        </div>

        {showArrows && n > 1 && (
          <button onClick={goNext} className={arrowBtn} aria-label="Вперёд" style={{ right: -ARROW_GAP }}>
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
