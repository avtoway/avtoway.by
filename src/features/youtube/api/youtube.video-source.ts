import "server-only";
import { VIDEO_CONFIG } from "@/shared/config/video";
import { logger } from "@/shared/lib/logger";
import type { VideoSource } from "@/entities/video/video-source";
import type { Video } from "@/entities/video/video";
import { fetchPlaylistItems, fetchVideoDetails } from "./youtube.api";
import { buildDurationMap, excludeShorts } from "./youtube.filters";
import { mapPlaylistItems } from "./youtube.mapper";

export class YouTubeVideoSource implements VideoSource {
  constructor(
    private readonly apiKey: string,
    private readonly channelId: string,
  ) {}

  async getChannelVideos(maxResults = VIDEO_CONFIG.MAX_VIDEOS): Promise<Video[]> {
    const uploadsPlaylistId = `UU${this.channelId.slice(2)}`;

    const playlistResult = await fetchPlaylistItems(
      this.apiKey,
      uploadsPlaylistId,
      maxResults * 2,
    );

    if (!playlistResult.ok) {
      logger.error("YouTube API error", playlistResult.error.message);
      return [];
    }

    const items = playlistResult.data.filter(
      (item) => item.snippet?.resourceId?.videoId,
    );
    if (items.length === 0) return [];

    const videoIds = items.map((item) => item.snippet.resourceId.videoId).join(",");

    const detailsResult = await fetchVideoDetails(this.apiKey, videoIds);
    if (!detailsResult.ok) {
      logger.error("YouTube API error (details)", detailsResult.error.message);
      return [];
    }

    const durationMap = buildDurationMap(detailsResult.data);

    const activeIds = new Set(
      [...durationMap.entries()]
        .filter(([, duration]) => excludeShorts(duration))
        .map(([id]) => id),
    );

    return mapPlaylistItems(items, activeIds).slice(0, maxResults);
  }

  getChannelUrl(): string {
    return `https://youtube.com/channel/${this.channelId}`;
  }

  getVideoUrl(videoId: string): string {
    return `https://youtube.com/watch?v=${videoId}`;
  }
}
