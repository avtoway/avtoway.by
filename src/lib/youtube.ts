import type { YTVideo } from "@/shared/types/youtube";

const YT_API = "https://www.googleapis.com/youtube/v3";

function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0") || 0;
  const minutes = parseInt(match[2] ?? "0") || 0;
  const seconds = parseInt(match[3] ?? "0") || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export async function getChannelVideos(
  channelId: string,
  maxResults = 15,
): Promise<YTVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    if (typeof window === "undefined") {
      console.error("YOUTUBE_API_KEY not configured. Add it to .env.local");
    }
    return [];
  }

  // Получаем playlist ID загрузок канала (UU + channelId без UC)
  const uploadsPlaylistId = `UU${channelId.slice(2)}`;

  const params = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults * 2),
    key: apiKey,
  });

  const res = await fetch(`${YT_API}/playlistItems?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const data = (await res.json()) as {
    error?: { message: string };
    items?: Array<{
      snippet: {
        publishedAt: string;
        title: string;
        resourceId: { videoId: string };
        thumbnails: Record<string, { url: string }>;
      };
    }>;
  };

  if (!res.ok || data.error) {
    console.error("YouTube API error:", data.error?.message ?? res.statusText);
    return [];
  }

  const items = (data.items ?? []).filter(
    (item) => item.snippet?.resourceId?.videoId,
  );
  if (items.length === 0) return [];

  // Фильтруем Shorts (длительность < 60s)
  const videoIds = items.map((item) => item.snippet.resourceId.videoId).join(",");
  const detailsParams = new URLSearchParams({
    part: "contentDetails",
    id: videoIds,
    key: apiKey,
  });

  const detailsRes = await fetch(`${YT_API}/videos?${detailsParams}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const detailsData = (await detailsRes.json()) as {
    error?: { message: string };
    items?: Array<{
      id: string;
      contentDetails: { duration: string };
    }>;
  };

  if (!detailsRes.ok || detailsData.error) {
    console.error(
      "YouTube API error (details):",
      detailsData.error?.message ?? detailsRes.statusText,
    );
    return [];
  }

  const durationMap = new Map<string, number>();
  for (const item of detailsData.items ?? []) {
    durationMap.set(item.id, parseDurationToSeconds(item.contentDetails.duration));
  }

  return items
    .filter((item) => {
      const duration = durationMap.get(item.snippet.resourceId.videoId) ?? 0;
      return duration >= 60;
    })
    .slice(0, maxResults)
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

export function getChannelUrl(channelId: string) {
  return `https://youtube.com/channel/${channelId}`;
}

export function getVideoUrl(videoId: string) {
  return `https://youtube.com/watch?v=${videoId}`;
}
