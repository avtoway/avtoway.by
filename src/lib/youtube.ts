const YT_API = "https://www.googleapis.com/youtube/v3";

export interface YTVideo {
  id: string;
  title: string;
  publishedAt: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres: string;
  };
}

interface YouTubeApiError {
  error?: { message: string };
}

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
  maxResults = 6,
): Promise<YTVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY not configured");
    return [];
  }

  const searchParams = new URLSearchParams({
    part: "snippet",
    channelId,
    order: "date",
    maxResults: String(maxResults * 3),
    key: apiKey,
  });

  const searchRes = await fetch(`${YT_API}/search?${searchParams}`);
  const searchData = (await searchRes.json()) as YouTubeApiError & {
    items?: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        publishedAt: string;
        thumbnails: Record<
          string,
          { url: string; width: number; height: number }
        >;
      };
    }>;
  };

  if (!searchRes.ok || searchData.error) {
    console.error(
      "YouTube API error:",
      searchData.error?.message ?? searchRes.statusText,
    );
    return [];
  }

  const items = (searchData.items ?? []).filter((item) => item.id?.videoId);
  if (items.length === 0) return [];

  const videoIds = items.map((item) => item.id.videoId).join(",");
  const detailsParams = new URLSearchParams({
    part: "contentDetails",
    id: videoIds,
    key: apiKey,
  });

  const detailsRes = await fetch(`${YT_API}/videos?${detailsParams}`);
  const detailsData = (await detailsRes.json()) as YouTubeApiError & {
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
      const duration = durationMap.get(item.id.videoId) ?? 0;
      return duration >= 60;
    })
    .slice(0, maxResults)
    .map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default?.url ?? "",
        medium: item.snippet.thumbnails.medium?.url ?? "",
        high: item.snippet.thumbnails.high?.url ?? "",
        maxres:
          item.snippet.thumbnails.maxres?.url ??
          item.snippet.thumbnails.high?.url ??
          "",
      },
    }));
}

export function getChannelUrl(channelId: string) {
  return `https://youtube.com/channel/${channelId}`;
}

export function getVideoUrl(videoId: string) {
  return `https://youtube.com/watch?v=${videoId}`;
}
