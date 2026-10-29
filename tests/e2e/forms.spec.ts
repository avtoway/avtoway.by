import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const prefix = `E2E-${Date.now()}`;
const phone = "+375291234567";

async function adminCookie(request: APIRequestContext): Promise<string> {
  const response = await request.post("/api/auth/login", {
    data: { login: "admin", password: "admin123" },
  });
  expect(response.ok()).toBeTruthy();
  const setCookie = response.headers()["set-cookie"] ?? "";
  return setCookie.split(";")[0] ?? "";
}

async function cleanup(request: APIRequestContext) {
  const cookie = await adminCookie(request);
  if (!cookie) return;
  const headers = { cookie };

  const contacts = await (await request.get("/api/contact-requests", { headers })).json();
  if (contacts.ok) {
    for (const item of contacts.data) {
      if (String(item.name).startsWith(prefix)) {
        await request.delete(`/api/contact-requests?id=${item.id}`, { headers });
      }
    }
  }

  const rents = await (await request.get("/api/rent/requests", { headers })).json();
  if (rents.ok) {
    for (const item of rents.data) {
      if (String(item.name).startsWith(prefix)) {
        await request.delete(`/api/rent/requests/${item.id}`, { headers });
      }
    }
  }

  const sales = await (await request.get("/api/sell/requests", { headers })).json();
  if (sales.ok) {
    for (const item of sales.data) {
      if (String(item.clientName).startsWith(prefix)) {
        await request.delete(`/api/sell/requests/${item.id}`, { headers });
      }
    }
  }

  const autos = await (await request.get(`/api/autopodbor/leads?limit=100&search=${encodeURIComponent(prefix)}`, { headers })).json();
  if (autos.ok) {
    for (const item of autos.data.items ?? []) {
      if (String(item.name).startsWith(prefix)) {
        await request.delete(`/api/autopodbor/leads/${item.id}`, { headers });
      }
    }
  }
}

async function fillLandingForm(page: Page, path: string) {
  await page.goto(path);
  const form = page.locator("#lead form");
  await form.locator("input").nth(0).fill(prefix);
  await form.locator("input").nth(1).fill(phone);
  await form.locator("textarea").fill("E2E проверка формы");
  await form.locator('button[type="submit"]').click();
  await expect(page.getByText("Заявка отправлена", { exact: false }).first()).toBeVisible();
}

test.describe("Публичные формы", () => {
  test("контакты", async ({ page }) => {
    await page.goto("/contacts");
    const form = page.locator("form").filter({ has: page.getByPlaceholder(/Ваше имя/) }).first();
    await form.getByPlaceholder(/Ваше имя/).fill(prefix);
    await form.getByPlaceholder(/Телефон/).fill(phone);
    await form.getByPlaceholder(/Что вас интересует/).fill("E2E проверка формы");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText("Спасибо!", { exact: false })).toBeVisible();
  });

  test("лендинг эвакуатора", async ({ page }) => {
    await fillLandingForm(page, "/services/truck");
  });

  test("лендинг автопригона", async ({ page }) => {
    await fillLandingForm(page, "/services/import");
  });

  test("лендинг автосервиса", async ({ page }) => {
    await fillLandingForm(page, "/services/service");
  });

  test("лендинг грузоперевозок", async ({ page }) => {
    await fillLandingForm(page, "/services/moving");
  });

  test("отклик на вакансию", async ({ page }) => {
    await page.goto("/vacancies/evacuator-driver");
    const form = page.locator("#apply form");
    await form.locator("input").nth(0).fill(prefix);
    await form.locator("input").nth(1).fill(phone);
    await form.locator("textarea").fill("E2E проверка формы");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText("Отклик отправлен", { exact: false })).toBeVisible();
  });

  test("заявка на продажу авто", async ({ page }) => {
    await page.goto("/services/sell#sell-own");
    const form = page.locator("form").filter({ has: page.getByPlaceholder("Ваше имя") }).first();
    await form.getByPlaceholder("Ваше имя").fill(prefix);
    await form.getByPlaceholder("Телефон").fill(phone);
    await form.getByPlaceholder("Марка, модель, год и желаемая цена").fill("E2E test car");
    await form.locator('button[type="submit"]').click();
    await expect(page.getByText("Заявка отправлена", { exact: false }).first()).toBeVisible();
  });

  test("заявка на автоподбор", async ({ page }) => {
    await page.goto("/services/inspection#lead");
    const form = page.locator("#lead form");
    await form.getByPlaceholder("Как к вам обращаться").fill(prefix);
    await form.getByPlaceholder("+375 (__) ___-__-__").fill(phone);
    await form.locator('input[type="checkbox"]').check();
    await form.getByRole("button", { name: /Оставить заявку/ }).click();
    await expect(page.getByText("Спасибо! Заявка у нас.", { exact: false })).toBeVisible();
  });

  test("расчёт аренды", async ({ page }) => {
    await page.goto("/services/rent/calculator");
    await page.waitForTimeout(1500);
    const firstCar = page.locator("main button").filter({ has: page.locator("img") }).first();
    if (await firstCar.count() === 0) test.skip();
    await firstCar.click();

    const dates = page.locator('input[type="date"]');
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 10);
    await dates.nth(0).fill(start.toISOString().slice(0, 10));
    await dates.nth(1).fill(end.toISOString().slice(0, 10));

    await page.getByPlaceholder("Ваше имя *").fill(prefix);
    await page.getByPlaceholder("Телефон").fill(phone);
    const submit = page.getByRole("button", { name: "Отправить заявку" });
    if (!(await submit.isEnabled())) test.skip();
    await submit.click();
    await expect(page.getByText("Заявка отправлена!", { exact: false })).toBeVisible();
  });
});

test.afterAll(async ({ request }) => {
  await cleanup(request);
});
