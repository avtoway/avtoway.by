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

const YT_API = "https://www.googleapis.com/youtube/v3";

export async function getChannelVideos(
  channelId: string,
  maxResults = 15,
): Promise<YTVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error("YOUTUBE_API_KEY not configured");
    return [];
  }

  // Получаем playlist ID загрузок канала (UU + channelId без UC)
  const uploadsPlaylistId = `UU${channelId.slice(2)}`;

  const params = new URLSearchParams({
    part: "snippet",
    playlistId: uploadsPlaylistId,
    maxResults: String(maxResults),
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

  return (data.items ?? [])
    .filter((item) => item.snippet?.resourceId?.videoId)
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
