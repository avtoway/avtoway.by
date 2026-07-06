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

export async function getChannelVideos(
  channelId: string,
  maxResults = 6,
): Promise<YTVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY not configured");
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    channelId,
    order: "date",
    maxResults: String(maxResults),
    key: apiKey,
  });

  const res = await fetch(`${YT_API}/search?${params}`);
  const data = (await res.json()) as YouTubeApiError & {
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

  if (!res.ok || data.error) {
    console.error("YouTube API error:", data.error?.message ?? res.statusText);
    return [];
  }

  return (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnails: {
        default: item.snippet.thumbnails.default?.url ?? "",
        medium: item.snippet.thumbnails.medium?.url ?? "",
        high: item.snippet.thumbnails.high?.url ?? "",
        maxres: item.snippet.thumbnails.maxres?.url ?? item.snippet.thumbnails.high?.url ?? "",
      },
    }));
}

export function getChannelUrl(channelId: string) {
  return `https://youtube.com/channel/${channelId}`;
}

export function getVideoUrl(videoId: string) {
  return `https://youtube.com/watch?v=${videoId}`;
}
