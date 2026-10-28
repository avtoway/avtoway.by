export const VIDEO_CONFIG = {
  MAX_VIDEOS: Number(process.env.NEXT_PUBLIC_MAX_VIDEOS ?? 15),
  EXCLUDE_SHORTS: process.env.EXCLUDE_SHORTS !== "false",
  // YouTube Shorts — до 3 минут. В карусель берём только длинные видео.
  SHORTS_MAX_DURATION: 180,
} as const;
