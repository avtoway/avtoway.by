import { expect, test } from "@playwright/test";

test.describe("Защита и SEO", () => {
  test("несуществующая услуга отдаёт 404", async ({ request }) => {
    const response = await request.get("/services/nope-123", { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("скрытая услуга отдаёт 404", async ({ request }) => {
    const services = await (await request.get("/api/services")).json();
    const hidden = services.data.find((service: { isActive: boolean }) => !service.isActive);
    test.skip(!hidden, "Все услуги включены");

    const response = await request.get(`/services/${hidden.slug}`, { maxRedirects: 0 });
    expect(response.status()).toBe(404);
  });

  test("админка недоступна без входа", async ({ request }) => {
    const response = await request.get("/admin", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers()["location"]).toContain("/admin/login");
  });

  test("security.txt отдаётся", async ({ request }) => {
    const response = await request.get("/.well-known/security.txt");
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Contact:");
  });

  test("ads.txt отдаётся", async ({ request }) => {
    const response = await request.get("/ads.txt");
    expect(response.status()).toBe(200);
  });

  test("калькулятор растаможки открывается", async ({ page }) => {
    await page.goto("/calculator/customs");
    await expect(page.getByRole("heading", { name: /Растаможка авто/i })).toBeVisible();
    await expect(page.getByText(/Итого/).first()).toBeVisible();
  });

  test("пример отчёта осмотра открывается", async ({ page }) => {
    await page.goto("/report/demo");
    await expect(page.getByText(/Демонстрационный пример отчёта/i)).toBeVisible();
  });

  test("чужой Origin блокируется для POST", async ({ request }) => {
    const response = await request.post("/api/contact", {
      headers: { origin: "https://evil.example" },
      data: { name: "CSRF", phone: "+375291112233", message: "test" },
    });
    expect(response.status()).toBe(403);
  });
});
