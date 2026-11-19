import { expect, test } from "@playwright/test";

const VIDEO_LINK = '#videos a[href*="youtube.com/watch"]';

test.describe("Адаптивность карусели видео", () => {
  test("на телефоне видно ровно одно видео и стрелки", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("#videos")).toBeVisible();

    const visibleCards = await page.locator(VIDEO_LINK).evaluateAll(nodes => {
      const width = window.innerWidth;
      return nodes
        .map(node => node.getBoundingClientRect())
        .filter(rect => rect.left >= -1 && rect.right <= width + 1 && rect.width > 0)
        .map(rect => Math.round(rect.width));
    });

    expect(visibleCards).toHaveLength(1);
    expect(visibleCards[0] ?? 0).toBeGreaterThan(300);

    await expect(page.getByRole("button", { name: "Предыдущее видео" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Следующее видео" })).toBeVisible();
  });

  test("страница не прокручивается по горизонтали", async ({ page }) => {
    for (const width of [320, 390, 768, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `ширина ${width}px`).toBeLessThanOrEqual(1);
    }
  });

  test("на десктопе видно несколько видео", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("#videos")).toBeVisible();

    // Карусель измеряет ширину после монтирования, поэтому ждём раскладку.
    await expect
      .poll(
        () =>
          page.locator(VIDEO_LINK).evaluateAll(nodes => {
            const width = window.innerWidth;
            return nodes
              .map(node => node.getBoundingClientRect())
              .filter(rect => rect.left >= -1 && rect.right <= width + 1 && rect.width > 0).length;
          }),
        { timeout: 5000 },
      )
      .toBeGreaterThanOrEqual(2);
  });

  test("стрелка листает карусель", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const counter = page.locator("#videos").getByText(/^\d+ \/ \d+$/).first();
    await expect(counter).toBeVisible();

    // Наведение останавливает автопрокрутку, чтобы проверка была стабильной.
    await page.locator("#videos").hover();
    const before = await counter.innerText();
    const parts = before.split("/").map(part => Number(part.trim()));
    const current = parts[0] ?? 1;
    const total = parts[1] ?? current;
    const next = current === total ? 1 : current + 1;

    await page.getByRole("button", { name: "Следующее видео" }).click();
    await expect(counter).toHaveText(`${next} / ${total}`);
  });
});
