import { describe, it, expect } from "vitest";
import { parseDurationToSeconds, excludeShorts } from "./youtube.filters";

describe("parseDurationToSeconds", () => {
  it("parses PT5M30S", () => {
    expect(parseDurationToSeconds("PT5M30S")).toBe(330);
  });

  it("parses PT1H2M10S", () => {
    expect(parseDurationToSeconds("PT1H2M10S")).toBe(3730);
  });

  it("parses PT45S (short)", () => {
    expect(parseDurationToSeconds("PT45S")).toBe(45);
  });

  it("returns 0 for invalid input", () => {
    expect(parseDurationToSeconds("invalid")).toBe(0);
  });
});

describe("excludeShorts", () => {
  it("excludes Shorts up to 3 minutes, including exactly 180 seconds", () => {
    expect(excludeShorts(45)).toBe(false);
    expect(excludeShorts(60)).toBe(false);
    expect(excludeShorts(74)).toBe(false);
    expect(excludeShorts(179)).toBe(false);
    expect(excludeShorts(180)).toBe(false);
  });

  it("keeps long-form videos longer than 3 minutes", () => {
    expect(excludeShorts(181)).toBe(true);
    expect(excludeShorts(308)).toBe(true);
    expect(excludeShorts(1200)).toBe(true);
  });
});
