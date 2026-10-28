import { container } from "@/di/container";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { ServiceSchema } from "@/shared/ui/json-ld";
import RentCatalog, { DEFAULT_RENT_FILTERS, type RentFilters } from "@/features/rent/ui/rent-catalog";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function one(params: SearchParams, key: string): string {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function parseFilters(params: SearchParams): RentFilters {
  const features = one(params, "features");
  return {
    ...DEFAULT_RENT_FILTERS,
    type: one(params, "type"),
    class: one(params, "class"),
    priceFrom: one(params, "priceFrom"),
    priceTo: one(params, "priceTo"),
    transmission: one(params, "transmission"),
    fuel: one(params, "fuel"),
    seats: one(params, "seats"),
    features: features ? features.split(",").filter(Boolean) : [],
    sort: one(params, "sort") || "recommended",
    view: one(params, "view") === "list" ? "list" : "grid",
  };
}

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const repo = container.get<RentCarRepository>("RentCarRepository");
  const db = getPrismaClient();

  const [cars, types, classes, comfortFeatures, tiers, usdRate, transmissions, fuels] = await Promise.all([
    repo.getAll(),
    repo.getTypes(),
    repo.getClasses(),
    db.comfortFeature.findMany({ orderBy: { sortOrder: "asc" } }),
    repo.getPricingTiers(),
    getUsdRate(),
    db.transmission.findMany({ orderBy: { name: "asc" } }),
    db.fuel.findMany({ orderBy: { name: "asc" } }),
  ]);

  const firstDiscount = tiers
    .filter(tier => tier.discount > 0)
    .sort((a, b) => a.minDays - b.minDays)[0];

  return (
    <>
      <ServiceSchema
        name="Аренда авто в Минске"
        description="Аренда автомобилей в Минске и по Беларуси: эконом, комфорт, бизнес, минивэны. Прозрачные цены и помощь с документами."
        url="/services/rent"
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Аренда" },
        ]}
      />
      <RentCatalog
        cars={cars}
        types={types}
        classes={classes}
        comfortFeatures={comfortFeatures}
        transmissions={transmissions}
        fuels={fuels}
        discountFrom={firstDiscount?.minDays ?? null}
        usdRate={usdRate}
        initialFilters={parseFilters(params)}
      />
    </>
  );
}
