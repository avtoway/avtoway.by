import type { Metadata } from "next";
import { container } from "@/di/container";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import SellCatalog from "@/features/sell/ui/sell-catalog";
import { parseSellFilters } from "@/features/sell/lib/filters";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Автомобили в продаже с проверкой АВТОWAY — Минск" },
  description:
    "Проверенные автомобили в продаже в Минске: кузов, двигатель, документы и юридическая чистота. Цены в BYN и USD, фото, отчёт эксперта, запись на осмотр.",
  alternates: { canonical: "/services/sell" },
  openGraph: {
    title: "Автомобили в продаже с проверкой АВТОWAY",
    description: "Каталог проверенных авто в Минске. Отчёт эксперта, честная история, помощь с оформлением.",
    url: "/services/sell",
    type: "website",
  },
};

type SearchParams = Record<string, string | string[] | undefined>;

export default async function SellPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const repo = container.get<SaleCarRepository>("SaleCarRepository");
  const [cars, usdRate] = await Promise.all([repo.getAll(), getUsdRate()]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Продажа авто" },
        ]}
      />
      <SellCatalog cars={cars} usdRate={usdRate} initialFilters={parseSellFilters(params)} />
    </>
  );
}
