import type { Metadata } from "next";
import { getServicePageData, ServiceHero, createMetadata } from "@/features/service-page/create-service-page";

export const metadata: Metadata = createMetadata(
  "Продажа авто | АВТОWAY",
  "Продам ваше авто быстро, дорого, без головной боли.",
);

export default async function SellPage() {
  const service = await getServicePageData({ slug: "sell" });
  if (!service) return null;

  return <ServiceHero title={service.title} desc={service.desc} />;
}
