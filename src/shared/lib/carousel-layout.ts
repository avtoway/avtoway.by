export interface CarouselLayoutInput {
  /** Ширина контейнера в пикселях (0 — ещё не измерена). */
  containerWidth: number;
  totalItems: number;
  /** Базовая ширина карточки на десктопе. */
  cardWidth: number;
  gap: number;
  /** Ширина «обрезка» соседней карточки по краям (десктоп). */
  peekWidth: number;
  maxVisible?: number;
}

export interface CarouselLayout {
  /** Сколько карточек видно полностью. */
  visible: number;
  /** Итоговая ширина карточки. */
  cardWidth: number;
  /** Ширина обрезка соседней карточки; 0 — обрезков нет. */
  peekWidth: number;
  /** Стрелки рисуем поверх карточки (мобильный режим). */
  arrowsInside: boolean;
}

/** Выше этого значения включается «мобильная» раскладка: одна карточка без обрезков. */
export const CAROUSEL_MOBILE_MAX = 639;

/** Сколько карточек помещается при заданном обрезке. */
function fitCount(width: number, card: number, gap: number, peek: number, total: number): number {
  const side = peek > 0 ? 2 * (peek + gap) : 0;
  if (width - side < card) return 0;
  return Math.min(total, Math.max(1, Math.floor((width - side - card) / (card + gap)) + 1));
}

/**
 * Подбирает раскладку так, чтобы ничего не вылезало за контейнер:
 * 1. на телефоне — одна карточка во всю ширину и стрелки поверх неё;
 * 2. на планшете и десктопе — максимум карточек с обрезками;
 * 3. если обрезки мешают показать больше карточек — убираем их;
 * 4. в крайнем случае сжимаем карточку.
 */
export function computeCarouselLayout({
  containerWidth,
  totalItems,
  cardWidth,
  gap,
  peekWidth,
  maxVisible = 4,
}: CarouselLayoutInput): CarouselLayout {
  const limit = Math.max(1, Math.min(maxVisible, totalItems || 1));
  const safeGap = Math.max(0, gap);

  // До первого измерения делаем безопасный вариант: одна карточка без обрезков.
  if (containerWidth <= 0) {
    return { visible: 1, cardWidth, peekWidth: 0, arrowsInside: true };
  }

  const width = Math.floor(containerWidth);
  const single = totalItems <= 1;

  if (single) {
    return { visible: 1, cardWidth: Math.min(cardWidth, width), peekWidth: 0, arrowsInside: true };
  }

  if (width <= CAROUSEL_MOBILE_MAX) {
    // Мобильный режим: ровно одна карточка, без обрезков и без вылезаний.
    return { visible: 1, cardWidth: width, peekWidth: 0, arrowsInside: true };
  }

  const withPeek = fitCount(width, cardWidth, safeGap, peekWidth, limit);
  const withoutPeek = fitCount(width, cardWidth, safeGap, 0, limit);

  if (withoutPeek > withPeek) {
    return { visible: withoutPeek, cardWidth, peekWidth: 0, arrowsInside: false };
  }

  if (withPeek >= 1) {
    return { visible: withPeek, cardWidth, peekWidth, arrowsInside: false };
  }

  // Совсем узкий контейнер: сжимаем карточку, чтобы она влезла.
  const peek = Math.min(peekWidth, Math.floor(width * 0.06));
  const card = Math.max(200, width - 2 * (peek + safeGap));
  return { visible: 1, cardWidth: card, peekWidth: peek, arrowsInside: false };
}

/** Ширина внутренней ленты с учётом обрезков и отступов. */
export function carouselInnerWidth(layout: CarouselLayout, gap: number, totalItems: number): number {
  const gapTotal = Math.max(0, layout.visible - 1) * gap;
  const side = totalItems > 1 && layout.peekWidth > 0 ? 2 * (layout.peekWidth + gap) : 0;
  return Math.ceil(layout.visible * layout.cardWidth + gapTotal + side);
}
