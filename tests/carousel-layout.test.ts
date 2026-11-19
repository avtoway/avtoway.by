import { describe, expect, it } from "vitest";
import { carouselInnerWidth, computeCarouselLayout } from "@/shared/lib/carousel-layout";

const base = { totalItems: 8, cardWidth: 320, gap: 14, peekWidth: 40 };

describe("computeCarouselLayout", () => {
  it("shows exactly one full-width card on phones", () => {
    for (const width of [320, 360, 390, 430, 639]) {
      const layout = computeCarouselLayout({ ...base, containerWidth: width });
      expect(layout.visible).toBe(1);
      expect(layout.cardWidth).toBe(width);
      expect(layout.peekWidth).toBe(0);
      expect(layout.arrowsInside).toBe(true);
    }
  });

  it("never overflows the container", () => {
    for (let width = 320; width <= 1600; width += 7) {
      const layout = computeCarouselLayout({ ...base, containerWidth: width });
      const inner = carouselInnerWidth(layout, base.gap, base.totalItems);
      expect(layout.visible).toBeGreaterThanOrEqual(1);
      expect(layout.cardWidth).toBeLessThanOrEqual(width);
      expect(inner).toBeLessThanOrEqual(width);
    }
  });

  it("drops peeks when they cost an extra card", () => {
    const layout = computeCarouselLayout({ ...base, containerWidth: 700 });
    expect(layout.visible).toBe(2);
    expect(layout.peekWidth).toBe(0);
  });

  it("keeps peeks on wide screens", () => {
    const layout = computeCarouselLayout({ ...base, containerWidth: 1104 });
    expect(layout.visible).toBe(3);
    expect(layout.peekWidth).toBe(40);
    expect(layout.arrowsInside).toBe(false);
  });

  it("does not exceed maxVisible", () => {
    const layout = computeCarouselLayout({ ...base, containerWidth: 3000, maxVisible: 4 });
    expect(layout.visible).toBe(4);
  });

  it("handles a single item and an unmeasured container", () => {
    const single = computeCarouselLayout({ ...base, totalItems: 1, containerWidth: 1200 });
    expect(single).toMatchObject({ visible: 1, cardWidth: 320, peekWidth: 0 });

    const unmeasured = computeCarouselLayout({ ...base, containerWidth: 0 });
    expect(unmeasured).toMatchObject({ visible: 1, peekWidth: 0, arrowsInside: true });
  });

  it("shrinks the card when even one does not fit", () => {
    const layout = computeCarouselLayout({ ...base, cardWidth: 700, containerWidth: 660 });
    expect(layout.visible).toBe(1);
    expect(layout.cardWidth).toBeLessThanOrEqual(660);
  });
});

describe("carouselInnerWidth", () => {
  it("counts gaps and peeks", () => {
    const layout = computeCarouselLayout({ ...base, containerWidth: 1104 });
    const expected = layout.visible * layout.cardWidth + (layout.visible - 1) * base.gap + 2 * (layout.peekWidth + base.gap);
    expect(carouselInnerWidth(layout, base.gap, base.totalItems)).toBe(expected);
  });

  it("ignores peeks for a single item", () => {
    const layout = computeCarouselLayout({ ...base, totalItems: 1, containerWidth: 1104 });
    expect(carouselInnerWidth(layout, base.gap, 1)).toBe(layout.cardWidth);
  });
});
