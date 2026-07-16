import type { Video } from "./video";

export interface VideoSource {
  getChannelVideos(maxResults?: number): Promise<Video[]>;
  getChannelUrl(): string;
  getVideoUrl(videoId: string): string;
}
