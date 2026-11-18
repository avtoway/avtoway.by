import { describe, it, expect, vi } from "vitest";
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

  it("does not grow memory under a key flood", () => {
    for (let i = 0; i < 10_050; i++) checkRateLimit(`flood:${i}`, 1, 60_000);
    // Самые старые ключи вытесняются, поэтому первый снова доступен.
    expect(checkRateLimit("flood:0", 1, 60_000)).toBe(true);
  });

  it("cleans up expired windows", () => {
    vi.useFakeTimers();
    try {
      resetRateLimit("expired");
      checkRateLimit("expired", 1, 1_000);
      vi.setSystemTime(Date.now() + 120_000);
      expect(checkRateLimit("expired", 1, 1_000)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
