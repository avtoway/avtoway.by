import type { Video } from "@/entities/video/video";

interface RawPlaylistItem {
  snippet: {
    publishedAt: string;
    title: string;
    resourceId: { videoId: string };
    thumbnails: Record<string, { url: string }>;
  };
}

export function mapPlaylistItems(
  items: RawPlaylistItem[],
  activeIds: Set<string>,
): Video[] {
  return items
    .filter((item) => activeIds.has(item.snippet.resourceId.videoId))
    .map((item) => {
      const thumbs = item.snippet.thumbnails;
      return {
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        thumbnails: {
          default: thumbs.default?.url ?? "",
          medium: thumbs.medium?.url ?? "",
          high: thumbs.high?.url ?? "",
          maxres: thumbs.maxres?.url ?? thumbs.high?.url ?? "",
        },
      };
    });
}
