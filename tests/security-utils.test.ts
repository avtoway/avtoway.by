import { describe, expect, it } from "vitest";
import { detectImage } from "@/shared/lib/image-type";
import { calculateCustoms } from "@/features/calculator/lib/customs";

describe("detectImage", () => {
  it("detects jpeg", () => {
    expect(detectImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))).toEqual({ extension: "jpg", mime: "image/jpeg" });
  });

  it("detects png", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(detectImage(png)).toEqual({ extension: "png", mime: "image/png" });
  });

  it("detects gif and webp", () => {
    expect(detectImage(Buffer.from("GIF89a000000", "ascii"))?.extension).toBe("gif");
    const webp = Buffer.concat([Buffer.from("RIFF", "ascii"), Buffer.alloc(4), Buffer.from("WEBP", "ascii")]);
    expect(detectImage(webp)?.extension).toBe("webp");
  });

  it("rejects svg, html and empty buffers", () => {
    expect(detectImage(Buffer.from("<svg/>"))).toBeNull();
    expect(detectImage(Buffer.from("<html>"))).toBeNull();
    expect(detectImage(Buffer.alloc(0))).toBeNull();
  });
});

describe("customs calculator", () => {
  it("calculates duty for a 3-5 year petrol car", () => {
    const result = calculateCustoms({ engine: "petrol", age: "from3to5", volumeCm3: 1600, priceEur: 12000, discount140: false });
    expect(result.dutyEur).toBe(2400);
    expect(result.totalByn).toBe(result.dutyByn + result.utilByn + result.feeByn);
  });

  it("applies the 50% discount", () => {
    const base = calculateCustoms({ engine: "diesel", age: "over5", volumeCm3: 2000, priceEur: 8000, discount140: false });
    const discounted = calculateCustoms({ engine: "diesel", age: "over5", volumeCm3: 2000, priceEur: 8000, discount140: true });
    expect(discounted.dutyEur).toBe(Math.round(base.dutyEur / 2));
  });

  it("uses price percent for electric cars and ignores volume", () => {
    const small = calculateCustoms({ engine: "electric", age: "under3", volumeCm3: 0, priceEur: 20000, discount140: false });
    const large = calculateCustoms({ engine: "electric", age: "under3", volumeCm3: 5000, priceEur: 20000, discount140: false });
    expect(small.dutyEur).toBe(large.dutyEur);
    expect(small.dutyEur).toBe(3000);
  });
});
