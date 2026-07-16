export const VIDEO_CONFIG = {
  MAX_VIDEOS: Number(process.env.NEXT_PUBLIC_MAX_VIDEOS ?? 15),
  EXCLUDE_SHORTS: process.env.EXCLUDE_SHORTS !== "false",
  SHORTS_MAX_DURATION: 60,
} as const;
