import { Suspense } from "react";
import HeroSection from "@/features/home/ui/hero-section";
import AboutSection from "@/features/home/ui/about-section";
import VideoSectionWrapper from "@/features/home/ui/video-section-wrapper";
import ServicesSectionWrapper from "@/features/home/ui/services-section-wrapper";
import VideoSectionSkeleton from "@/shared/ui/video-section-skeleton";
import ServicesSectionSkeleton from "@/shared/ui/services-section-skeleton";

export const revalidate = 300;

export default function MarketingHome() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <Suspense fallback={<VideoSectionSkeleton />}>
        <VideoSectionWrapper />
      </Suspense>
      <Suspense fallback={<ServicesSectionSkeleton />}>
        <ServicesSectionWrapper />
      </Suspense>
    </>
  );
}
