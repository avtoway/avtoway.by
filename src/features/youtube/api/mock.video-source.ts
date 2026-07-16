import type { VideoSource } from "@/entities/video/video-source";
import type { Video } from "@/entities/video/video";

export class MockVideoSource implements VideoSource {
  async getChannelVideos(_maxResults?: number): Promise<Video[]> {
    return [
      {
        id: "mock1",
        title: "Mock Video 1",
        publishedAt: "2026-01-01T00:00:00Z",
        thumbnails: {
          default: "",
          medium: "",
          high: "",
          maxres: "",
        },
      },
    ];
  }

  getChannelUrl(): string {
    return "https://youtube.com/@mock";
  }

  getVideoUrl(videoId: string): string {
    return `https://youtube.com/watch?v=${videoId}`;
  }
}
