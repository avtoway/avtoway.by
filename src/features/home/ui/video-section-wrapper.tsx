import { container } from "@/di/container";
import type { VideoSource } from "@/entities/video/video-source";
import VideoSection from "./video-section";

export default async function VideoSectionWrapper() {
  const videoSource = container.get<VideoSource>("VideoSource");
  const videos = await videoSource.getChannelVideos();
  // Если API не настроен или видео нет — не показываем пустую секцию на главной.
  if (videos.length === 0) return null;
  return <VideoSection videos={videos} />;
}
