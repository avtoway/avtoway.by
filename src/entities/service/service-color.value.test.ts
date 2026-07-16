import { describe, it, expect } from "vitest";
import { ServiceColor } from "./service-color.value";

describe("ServiceColor", () => {
  it("parses hex and returns RGB", () => {
    const color = ServiceColor.from("#ef4444");
    expect(color.rgb).toBe("239,68,68");
  });

  it("generates rgba string", () => {
    const color = ServiceColor.from("#ef4444");
    expect(color.rgba(0.15)).toBe("rgba(239,68,68,0.15)");
  });

  it("generates shadow string", () => {
    const color = ServiceColor.from("#ef4444");
    expect(color.shadow(0.4)).toBe("0 20px 60px rgba(239,68,68,0.4)");
  });

  it("throws on invalid hex", () => {
    expect(() => ServiceColor.from("invalid")).toThrow();
    expect(() => ServiceColor.from("#GGGGGG")).toThrow();
  });
});
