import { VIDEO_CONFIG } from "@/shared/config/video";

export function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0") || 0;
  const minutes = parseInt(match[2] ?? "0") || 0;
  const seconds = parseInt(match[3] ?? "0") || 0;
  return hours * 3600 + minutes * 60 + seconds;
}

export function excludeShorts(durationSeconds: number): boolean {
  if (!VIDEO_CONFIG.EXCLUDE_SHORTS) return true;
  return durationSeconds >= VIDEO_CONFIG.SHORTS_MAX_DURATION;
}

export function buildDurationMap(
  items: Array<{ id: string; contentDetails: { duration: string } }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    map.set(item.id, parseDurationToSeconds(item.contentDetails.duration));
  }
  return map;
}
