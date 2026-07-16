import "server-only";
import { HttpClient } from "@/shared/api/http-client";
import { PlaylistItemsResponseSchema, VideoDetailsResponseSchema } from "./youtube.schema";

const YT_API = "https://www.googleapis.com/youtube/v3";

const http = new HttpClient({ baseURL: YT_API, timeout: 10_000, retries: 2 });

export async function fetchPlaylistItems(
  apiKey: string,
  playlistId: string,
  maxResults: number,
) {
  const params = new URLSearchParams({
    part: "snippet",
    playlistId,
    maxResults: String(maxResults),
    key: apiKey,
  });

  const result = await http.get<unknown>(`/playlistItems?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!result.ok) return result;

  const parsed = PlaylistItemsResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: { code: "PARSE" as const, message: "Invalid playlist items response" },
    };
  }

  if (parsed.data.error) {
    return {
      ok: false as const,
      error: { code: "SERVER" as const, message: parsed.data.error.message },
    };
  }

  return { ok: true as const, data: parsed.data.items ?? [] };
}

export async function fetchVideoDetails(
  apiKey: string,
  videoIds: string,
) {
  const params = new URLSearchParams({
    part: "contentDetails",
    id: videoIds,
    key: apiKey,
  });

  const result = await http.get<unknown>(`/videos?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!result.ok) return result;

  const parsed = VideoDetailsResponseSchema.safeParse(result.data);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: { code: "PARSE" as const, message: "Invalid video details response" },
    };
  }

  if (parsed.data.error) {
    return {
      ok: false as const,
      error: { code: "SERVER" as const, message: parsed.data.error.message },
    };
  }

  return { ok: true as const, data: parsed.data.items ?? [] };
}
