import { cache } from "react";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { VideoSource } from "@/entities/video/video-source";

export const getHomePageData = cache(async () => {
  const videoSource = container.get<VideoSource>("VideoSource");
  const serviceRepo = container.get<ServiceRepository>("ServiceRepository");

  const [videos, services] = await Promise.all([
    videoSource.getChannelVideos(),
    serviceRepo.getActive(),
  ]);

  return { videos, services };
});
