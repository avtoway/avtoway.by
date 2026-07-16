import type { Metadata } from "next";
import { getServicePageData, ServiceHero, createMetadata } from "@/features/service-page/create-service-page";

export const metadata: Metadata = createMetadata(
  "Автоподбор в Минске | АВТОWAY",
  "Проверка автомобилей от и до. Диагностика, документы, торг — полное сопровождение.",
);

export default async function InspectionPage() {
  const service = await getServicePageData({ slug: "inspection" });
  if (!service) return null;

  return <ServiceHero title={service.title} desc={service.desc} />;
}
