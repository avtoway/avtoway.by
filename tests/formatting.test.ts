import { describe, expect, it } from "vitest";
import { slugify } from "@/shared/lib/slug";
import { formatPhone } from "@/shared/ui/phone-input";

describe("slugify", () => {
  it("transliterates Russian and removes punctuation", () => {
    expect(slugify("Мойка и детейлинг")).toBe("moyka-i-deteyling");
    expect(slugify("Подбор «под ключ»")).toBe("podbor-pod-klyuch");
  });

  it("limits length and trims dashes", () => {
    expect(slugify("  ---Авто---  ")).toBe("avto");
    expect(slugify("a".repeat(120)).length).toBe(80);
  });
});

describe("formatPhone", () => {
  it("formats Belarus numbers step by step", () => {
    expect(formatPhone("29")).toBe("+375 (29)");
    expect(formatPhone("29123")).toBe("+375 (29) 123");
    expect(formatPhone("291234567")).toBe("+375 (29) 123-45-67");
    expect(formatPhone("80291234567")).toBe("+375 (29) 123-45-67");
    expect(formatPhone("+375291234567")).toBe("+375 (29) 123-45-67");
  });

  it("keeps foreign international numbers as typed", () => {
    expect(formatPhone("+7 999 123-45-67")).toBe("+7 999 123-45-67");
  });

  it("returns empty string for empty input", () => {
    expect(formatPhone("")).toBe("");
    expect(formatPhone("   ")).toBe("");
  });
});
