import type { Metadata } from "next";
import { getServicePageData, ServiceHero, createMetadata } from "@/features/service-page/create-service-page";

export const metadata: Metadata = createMetadata(
  "Аренда авто в Минске | АВТОWAY",
  "Аренда автомобилей без залога. Авто под такси, просто аренда и подкаты. Прозрачно и честно.",
);

export default async function RentPage() {
  const service = await getServicePageData({ slug: "rent" });
  if (!service) return null;

  return <ServiceHero title={service.title} desc={service.desc} />;
}
