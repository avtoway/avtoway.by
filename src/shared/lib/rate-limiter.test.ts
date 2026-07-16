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
});
