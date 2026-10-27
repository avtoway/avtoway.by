import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { AutoPodborPublicData } from "@/entities/autopodbor/autopodbor.types";
import AutopodborPage from "@/features/autopodbor/ui/autopodbor-page";
import AutoPodborStructuredData from "@/features/autopodbor/ui/structured-data";
import { publicAssetExists } from "@/features/autopodbor/lib/assets";

export const revalidate = 300;

async function getData(): Promise<AutoPodborPublicData> {
  const repo = container.get<AutoPodborRepository>("AutoPodborRepository");
  return repo.getPublicData();
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData();
  const settings = data.settings;

  if (!settings.isActive) {
    return { title: "Автоподбор", robots: { index: false, follow: false } };
  }

  const title =
    settings.seoTitle || "Автоподбор в Минске и Беларуси — проверка авто перед покупкой | АВТОWAY";
  const description =
    settings.seoDescription ||
    "Автоподбор под ключ, разовый осмотр и эксперт на день. Проверяем кузов, двигатель, пробег и документы, торгуемся за вас. Отчёт с фото и видео, договор, гарантия.";

  const ogImage = settings.ogImage && publicAssetExists(settings.ogImage)
    ? settings.ogImage
    : "/opengraph-image.jpg";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/services/inspection" },
    robots: { index: !settings.noindex, follow: true },
    openGraph: {
      title,
      description,
      url: "/services/inspection",
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.heroImageAlt || "Автоподбор АВТОWAY" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function InspectionLandingPage() {
  const [data, serviceRepo] = await Promise.all([
    getData(),
    Promise.resolve(container.get<ServiceRepository>("ServiceRepository")),
  ]);

  if (!data.settings.isActive) notFound();

  const service = await serviceRepo.getBySlug("inspection");
  if (!service || !service.isActive) notFound();

  return (
    <>
      <AutoPodborStructuredData data={data} />
      <AutopodborPage data={data} />
    </>
  );
}
