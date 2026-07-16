import { container } from "@/di/container";
import type { VideoSource } from "@/entities/video/video-source";
import VideoSection from "./video-section";

export default async function VideoSectionWrapper() {
  const videoSource = container.get<VideoSource>("VideoSource");
  const videos = await videoSource.getChannelVideos();
  return <VideoSection videos={videos} />;
}
