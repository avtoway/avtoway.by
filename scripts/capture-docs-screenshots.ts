/**
 * Снимает скриншоты админки и главной для Word-инструкций.
 * Требует запущенный сайт: npm run dev -- -p 3001
 * Запуск: npm run docs:screenshots
 */
import { chromium, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const OUT = path.join(process.cwd(), "docs", "screenshots");
const LOGIN = process.env.DOCS_LOGIN ?? "admin";
const PASSWORD = process.env.DOCS_PASSWORD ?? "admin123";

async function settle(page: Page, ms = 700) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(ms);
}

async function shot(page: Page, name: string, options: { fullPage?: boolean } = {}) {
  await settle(page);
  await page.screenshot({
    path: path.join(OUT, `${name}.png`),
    fullPage: options.fullPage ?? false,
    animations: "disabled",
  });
  console.log(`  ✓ ${name}.png`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "ru-RU",
  });
  const page = await context.newPage();

  console.log("Публичная часть");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot(page, "00-home-hero");
  await page.goto(`${BASE}/services`, { waitUntil: "networkidle" });
  await shot(page, "00-services");

  console.log("Вход в админку");
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  await shot(page, "01-login");

  const inputs = page.locator("form input");
  await inputs.nth(0).fill(LOGIN);
  await inputs.nth(1).fill(PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await page.waitForURL("**/admin", { timeout: 30_000 });
  await settle(page, 1200);

  console.log("Админка");
  // Для скриншота дашборда скрываем нижний блок «Последние действия»,
  // чтобы в инструкцию не попадали тестовые записи.
  await page.setViewportSize({ width: 1440, height: 760 });
  await shot(page, "02-dashboard");
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto(`${BASE}/admin/services`);
  await shot(page, "03-services");
  const addService = page.getByRole("button", { name: /Добавить/ }).first();
  if (await addService.count()) {
    await addService.click();
    await page.waitForTimeout(600);
    await shot(page, "04-service-form");
    await page.keyboard.press("Escape");
  }

  for (const [route, name] of [
    ["/admin/requests", "05-requests"],
    ["/admin/clients", "06-clients"],
    ["/admin/tasks", "07-tasks"],
    ["/admin/rent", "08-rent"],
    ["/admin/rent/calculator", "09-rent-calculator"],
    ["/admin/sell", "10-sell"],
    ["/admin/inspection", "11-autopodbor"],
    ["/admin/reports", "12-reports"],
    ["/admin/blog", "13-blog"],
    ["/admin/landings", "14-landings"],
    ["/admin/partners", "15-partners"],
    ["/admin/vacancies", "16-vacancies"],
    ["/admin/contacts", "17-contacts"],
    ["/admin/notifications", "18-notifications"],
    ["/admin/analytics", "19-analytics"],
    ["/admin/promotion", "20-promotion"],
    ["/admin/email", "21-email"],
    ["/admin/users", "22-users"],
    ["/admin/roles", "23-roles"],
    ["/admin/audit-logs", "24-audit"],
    ["/admin/monitoring", "25-monitoring"],
    ["/admin/help", "26-help"],
  ] as const) {
    await page.goto(`${BASE}${route}`);
    if (route === "/admin/audit-logs") {
      const entitySelect = page.locator("select").nth(1);
      if (await entitySelect.count()) {
        await entitySelect.selectOption("Service");
        await page.waitForTimeout(600);
      }
    }
    await shot(page, name);
  }

  await page.goto(`${BASE}/admin/promotion`);
  await settle(page);
  const addCampaign = page.getByRole("button", { name: /Кампания/ }).first();
  if (await addCampaign.count()) {
    await addCampaign.click();
    await page.waitForTimeout(600);
    await shot(page, "27-promotion-form");
  }

  console.log("Мобильная админка");
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    locale: "ru-RU",
    storageState: await context.storageState(),
  });
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(`${BASE}/admin`);
  await settle(mobilePage, 1000);
  await shot(mobilePage, "28-mobile-admin-menu", { fullPage: false });
  // Открываем меню, чтобы показать бургер и группы.
  const burger = mobilePage.getByRole("button", { name: "Открыть меню" });
  if (await burger.count()) {
    await burger.click();
    await mobilePage.waitForTimeout(700);
    await shot(mobilePage, "29-mobile-admin-drawer");
  }

  await mobile.close();
  await browser.close();
  console.log(`Готово: ${OUT}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
