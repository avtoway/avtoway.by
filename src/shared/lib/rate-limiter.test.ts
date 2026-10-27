import { describe, it, expect } from "vitest";
import { checkRateLimit, resetRateLimit } from "./rate-limiter";

describe("checkRateLimit", () => {
  it("allows first attempt", () => {
    resetRateLimit("test:1");
    expect(checkRateLimit("test:1")).toBe(true);
  });

  it("blocks after 5 attempts", () => {
    resetRateLimit("test:2");
    for (let i = 0; i < 5; i++) checkRateLimit("test:2");
    expect(checkRateLimit("test:2")).toBe(false);
  });

  it("supports custom limits", () => {
    resetRateLimit("test:3");
    for (let i = 0; i < 2; i++) expect(checkRateLimit("test:3", 2)).toBe(true);
    expect(checkRateLimit("test:3", 2)).toBe(false);
  });

  it("keeps different keys independent", () => {
    resetRateLimit("test:4a");
    resetRateLimit("test:4b");
    expect(checkRateLimit("test:4a", 1)).toBe(true);
    expect(checkRateLimit("test:4a", 1)).toBe(false);
    expect(checkRateLimit("test:4b", 1)).toBe(true);
  });
});
