import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import { getPriceLabel, getPeriodPrices, formatPrice, type RentPricingTier } from "@/shared/lib/price";
import { TRANSMISSION_LABEL, FUEL_LABEL } from "@/shared/lib/car-dictionaries";
import { telegramHandle, telegramUrl } from "@/shared/lib/social";
import PhotoLightboxGallery from "@/shared/ui/photo-lightbox-gallery";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { ServiceSchema } from "@/shared/ui/json-ld";
import { DEFAULT_TAXI_REQUIREMENTS } from "@/shared/lib/taxi-requirements";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

async function getContact() {
  const db = getPrismaClient();
  return db.contact.findFirst();
}
async function getCar(slug: string) {
  const db = getPrismaClient();
  return db.rentCar.findUnique({
    where: { slug, isActive: true },
    include: { rentType: true, classRel: true, conditions: { include: { condition: true } } },
  });
}
async function getPricingTiers(): Promise<RentPricingTier[]> {
  const db = getPrismaClient();
  const rows = await db.rentPricingTier.findMany({ orderBy: { sortOrder: "asc" } });
  return rows.map(r => ({ id: r.id, minDays: r.minDays, maxDays: r.maxDays ?? null, discount: r.discount, sortOrder: r.sortOrder }));
}

async function getSimilarCars(carId: string, classId: string | null, rentTypeId: string | null) {
  const db = getPrismaClient();
  const rows = await db.rentCar.findMany({
    where: { isActive: true, id: { not: carId } },
    include: { rentType: true, classRel: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows
    .sort((a, b) => {
      const score = (row: typeof a) => (row.classId === classId ? 2 : 0) + (row.rentTypeId === rentTypeId ? 1 : 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: "Авто не найдено", robots: { index: false, follow: false } };
  const title = `${car.name} — аренда в Минске | АВТОWAY`;
  const description =
    car.description ||
    `${car.name}: аренда в Минске и Беларуси. Характеристики, стоимость за сутки и неделю, условия бронирования.`;
  const image = car.mainPhoto || car.photos?.split(",")[0] || "/opengraph-image.jpg";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/services/rent/${slug}` },
    openGraph: {
      title,
      description,
      url: `/services/rent/${slug}`,
      type: "website",
      images: [{ url: image, alt: car.name }],
    },
  };
}

export default async function RentCarDetailPage({ params }: Props) {
  const { slug } = await params;
  const [car, contact] = await Promise.all([
    getCar(slug),
    getContact(),
  ]);
  if (!car) notFound();

  const photos = (car.photos ?? "").split(",").filter(Boolean);
  const features = (car.features ?? "").split(",").filter(Boolean);
  const mainPhoto = car.mainPhoto ?? photos[0];
  const orderedPhotos = mainPhoto
    ? [mainPhoto, ...photos.filter(photo => photo !== mainPhoto)]
    : photos;
  const usdRate = await getUsdRate();
  const tiers = await getPricingTiers();
  const similar = await getSimilarCars(car.id, car.classId, car.rentTypeId);
  const isTaxi = car.rentType?.slug === "taxi";
  const taxiRequirements = isTaxi ? (car.taxiRequirements?.trim() || DEFAULT_TAXI_REQUIREMENTS) : "";
  const priceLabel = getPriceLabel(car);
  const priceAmount = priceLabel ? parseInt(priceLabel.replace(/\D/g, "")) : null;
  const heroUsd = usdRate && priceAmount ? Math.round(priceAmount / usdRate) : null;
  const periodPrices = !isTaxi && car.priceDay != null ? getPeriodPrices(car.priceDay, tiers) : null;
  const conditions = (car.conditions ?? []).filter((c: any) => c.condition?.name);

  return (
    <div className="min-h-screen bg-zinc-950">
      <ServiceSchema
        name={`${car.name} — аренда`}
        description={car.description ?? `Аренда ${car.name} в Минске и Беларуси.`}
        url={`/services/rent/${car.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Аренда", href: "/services/rent" },
          { label: car.name },
        ]}
      />
      {/* Breadcrumbs + back */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-2">
        <PageBreadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/services" },
            { label: "Аренда", href: "/services/rent" },
            { label: car.name },
          ]}
        />
        <Link href="/services/rent"
          className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition">
          ← Назад к списку
        </Link>
      </div>

      {/* Title + price row (before photos) */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{car.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {car.rentType && (
                <span className="inline-block rounded bg-red-600/20 px-2.5 py-0.5 text-sm font-medium text-red-400">
                  {car.rentType.name}
                </span>
              )}
              {car.classRel?.name && (
                <span className="inline-block rounded bg-blue-600/20 px-2.5 py-0.5 text-sm font-medium text-blue-400">
                  {car.classRel.name}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            {priceLabel && <PriceHero priceLabel={priceLabel} usdVal={heroUsd} />}
            <Link href="/services/rent/calculator"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
              Рассчитать аренду
            </Link>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <section className="bg-zinc-900/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <PhotoLightboxGallery photos={orderedPhotos} title={car.name} />
        </div>
      </section>

      {/* Description below photos */}
      {car.description && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-4">
          <h2 className="mb-4 text-lg font-semibold text-white">Описание</h2>
          <p className="text-base leading-relaxed text-zinc-300 whitespace-pre-line">{car.description}</p>
        </div>
      )}

      {/* Specs + price grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Specs + features */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-white">Характеристики</h2>
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 sm:grid-cols-3">
              {car.classRel?.name && <Spec label="Класс" value={car.classRel.name} />}
              <Spec label="Год" value={car.year?.toString()} />
              <Spec label="Коробка" value={TRANSMISSION_LABEL[car.transmission ?? ""] ?? car.transmission ?? undefined} />
              <Spec label="Топливо" value={FUEL_LABEL[car.fuel ?? ""] ?? car.fuel ?? undefined} />
              <Spec label="Объём" value={car.engineVolume ? `${car.engineVolume} л` : undefined} />
              <Spec label="Мест" value={car.seats?.toString()} />
              {car.color && <Spec label="Цвет" value={car.color ?? undefined} />}
            </div>

            {features.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-white">Комфорт и опции</h2>
                <div className="flex flex-wrap gap-2">
                  {features.map(f => (
                    <span key={f} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prices */}
          {(periodPrices || (isTaxi && car.price7Days != null)) && (
            <div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-white">Стоимость</h2>
                <div className="mt-4 space-y-3">
                  {periodPrices ? (
                    periodPrices.map((p, i) => {
                      const usdVal = usdRate ? Math.round(p.perDay / usdRate) : null;
                      return (
                        <div key={i} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                          <div>
                            <span className="text-sm text-zinc-400">{p.label}</span>
                            {usdVal && <p className="text-[10px] text-zinc-600">≈ ${usdVal.toLocaleString()}/сутки</p>}
                          </div>
                          <span className="text-base font-bold text-green-400">{p.perDay} BYN/сутки</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Неделя (мин. 7 дней)</span>
                      <span className="text-base font-bold text-green-400">{formatPrice(car.price7Days)}</span>
                    </div>
                  )}
                </div>
                {!isTaxi && <p className="mt-3 text-[11px] text-zinc-600">Скидки за длительный срок уже учтены в цене за сутки.</p>}
                {isTaxi && <p className="mt-3 text-[11px] text-zinc-600">Аренда под такси — только от недели, цена за неделю.</p>}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Conditions */}
      {conditions.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-10">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Условия аренды</h2>
            <ul className="space-y-2.5">
              {conditions.map((c: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                  <span className="mt-0.5 text-red-400">•</span>
                  <span>
                    <span className="font-medium text-white">{c.name}:</span>{" "}
                    <span className="text-zinc-400">{c.value || "уточняйте у менеджера"}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Taxi driver requirements and liability */}
      {isTaxi && taxiRequirements && (
        <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
          <div className="overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-zinc-900/60 to-zinc-950">
            <div className="border-b border-amber-500/15 p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-xl text-amber-300" aria-hidden="true">
                  !
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Памятка водителю такси</p>
                  <h2 className="mt-1 text-2xl font-bold text-white">Допуск и ответственность</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                    Перед началом аренды водитель подтверждает, что соответствует требованиям законодательства Республики Беларусь,
                    прошёл необходимые осмотры и несёт ответственность за допуск к управлению.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 sm:p-7">
              <TaxiRequirementText text={taxiRequirements} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-amber-500/15 bg-black/20 px-6 py-4 sm:px-7">
              <span className="mr-1 text-[11px] uppercase tracking-wide text-zinc-500">Источники:</span>
              <a href="https://pravo.by/document/?guid=12551&p0=C22600147" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-700/80 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-amber-400/50 hover:text-amber-200">
                Правила № 147
              </a>
              <a href="https://pravo.by/document/?guid=12551&p0=P32400032" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-700/80 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-amber-400/50 hover:text-amber-200">
                Указ № 32
              </a>
              <a href="https://www.mintrans.gov.by/ru/administrativnye-protsedury/litsenzirovanie-transportnoj-deyatelnosti" target="_blank" rel="noopener noreferrer"
                className="rounded-md border border-zinc-700/80 px-2.5 py-1 text-xs text-zinc-400 transition hover:border-amber-400/50 hover:text-amber-200">
                Лицензирование · Минтранс
              </a>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-zinc-600">
            Информация носит справочный характер. Актуальные требования и перечень документов уточняйте в официальных источниках и у перевозчика.
          </p>
        </section>
      )}

      {/* Contact */}
      {contact && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <ContactBlock contact={contact} />
        </section>
      )}

      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Похожие авто в аренду</h2>
            <Link href="/services/rent" className="text-sm text-red-400 hover:text-red-300">Весь парк →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map(item => <SimilarRentCard key={item.id} car={item} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function TaxiRequirementText({ text }: { text: string }) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  return (
    <div className="space-y-2.5">
      {lines.map((line, index) => {
        if (/^Допуск водителя/i.test(line)) return null;
        if (/^Лицензия и ответственность$/i.test(line)) {
          return <h3 key={`heading-${index}`} className="pt-3 text-base font-semibold text-white">{line}</h3>;
        }
        if (line.startsWith("•")) {
          return (
            <div key={`item-${index}`} className="flex gap-3 text-sm leading-6 text-zinc-300">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              <span>{line.slice(1).trim()}</span>
            </div>
          );
        }
        return <p key={`text-${index}`} className="text-sm leading-7 text-zinc-300">{line}</p>;
      })}
    </div>
  );
}

type SimilarRentCar = Awaited<ReturnType<typeof getSimilarCars>>[number];

function SimilarRentCard({ car }: { car: SimilarRentCar }) {
  const photo = car.mainPhoto || car.photos?.split(",")[0] || "/images/placeholder-car.webp";
  const price = getPriceLabel(car);
  return (
    <Link href={`/services/rent/${car.slug}`} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition hover:border-zinc-600 hover:bg-zinc-900">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-800">
        <Image src={photo} alt={car.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] text-white backdrop-blur-sm">{price ?? "по запросу"}</span>
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-white group-hover:text-red-400">{car.name}</p>
        <p className="mt-1 text-xs text-zinc-500">{car.year} · {car.classRel?.name ?? "Аренда"} · {car.rentType?.name ?? ""}</p>
      </div>
    </Link>
  );
}

function Spec({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-white">{value ?? "—"}</p>
    </div>
  );
}

function PriceHero({ priceLabel, usdVal }: { priceLabel: string; usdVal: number | null }) {
  return (
    <div className="flex shrink-0 items-baseline gap-3 rounded-xl border border-green-800/50 bg-green-950/20 px-5 py-3 sm:flex-col sm:items-end">
      <p className="text-sm text-zinc-500">от</p>
      <p className="text-2xl font-bold text-green-400 sm:text-3xl">{priceLabel}</p>
      {usdVal && <p className="text-xs text-zinc-500">≈ ${usdVal.toLocaleString()}</p>}
    </div>
  );
}

function ContactBlock({ contact }: { contact: Record<string, unknown> }) {
  const items: { key: string; label: string; icon: string; href: (v: string) => string; display?: (v: string) => string }[] = [
    { key: "phone", label: "Позвонить", icon: "📞", href: v => `tel:${v}` },
    { key: "telegram", label: "Telegram", icon: "✈", href: v => telegramUrl(v) ?? v, display: v => telegramHandle(v) },
    { key: "viber", label: "Viber", icon: "💬", href: v => `viber://chat?number=${encodeURIComponent(v.replace(/\D/g, ""))}` },
    { key: "whatsapp", label: "WhatsApp", icon: "💬", href: v => `https://wa.me/${v.replace(/\D/g, "")}` },
    { key: "instagram", label: "Instagram", icon: "📷", href: v => v },
  ];

  const visible = items.filter(i => contact[i.key]).map(i => ({ ...i, value: contact[i.key] as string }));

  if (visible.length === 0) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Связь с нами</h2>
      <div className="flex flex-wrap gap-3">
        {visible.map(i => (
          <a
            key={i.key}
            href={i.href(i.value)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm transition hover:border-red-500 hover:bg-zinc-800"
          >
            <span className="text-lg">{i.icon}</span>
            <div>
              <p className="text-xs text-zinc-500">{i.label}</p>
              <p className="text-sm font-medium text-white">{i.display ? i.display(i.value) : i.value}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
