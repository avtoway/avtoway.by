import { describe, it, expect } from "vitest";
import { YouTubeVideoId } from "./youtube-video-id.value";

describe("YouTubeVideoId", () => {
  it("creates from valid 11-char ID", () => {
    const id = YouTubeVideoId.from("dQw4w9WgXcQ");
    expect(id.value).toBe("dQw4w9WgXcQ");
  });

  it("generates watch URL", () => {
    const id = YouTubeVideoId.from("dQw4w9WgXcQ");
    expect(id.url).toBe("https://youtube.com/watch?v=dQw4w9WgXcQ");
  });

  it("throws on empty string", () => {
    expect(() => YouTubeVideoId.from("")).toThrow();
  });

  it("throws on invalid characters", () => {
    expect(() => YouTubeVideoId.from("!!!invalid!!!")).toThrow();
  });
});
