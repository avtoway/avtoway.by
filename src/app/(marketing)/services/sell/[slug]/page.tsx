import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";
import type { SaleCar } from "@/entities/sell/sale-car.types";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import {
  BODY_TYPE_LABEL,
  DRIVE_TYPE_LABEL,
  FUEL_LABEL,
  INTERIOR_COLOR_LABEL,
  INTERIOR_MATERIAL_LABEL,
  SALE_CONDITION_LABEL,
  SALE_STATUS_LABEL,
  SALE_STATUS_STYLE,
  TRANSMISSION_LABEL,
  saleFeatureGroups,
} from "@/shared/lib/car-dictionaries";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import SaleGallery from "@/features/sell/ui/sale-gallery";
import SaleContactCard from "@/features/sell/ui/sale-contact-card";
import SaleCard from "@/features/sell/ui/sale-card";
import SaleStructuredData from "@/features/sell/ui/sale-structured-data";

interface Props {
  params: Promise<{ slug: string }>;
}

function repo() {
  return container.get<SaleCarRepository>("SaleCarRepository");
}

async function getCar(slug: string): Promise<SaleCar | null> {
  return repo().getBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car || !car.isActive || car.status === "draft") {
    return { title: "Автомобиль не найден", robots: { index: false, follow: false } };
  }

  const title = car.seoTitle || `${car.title}, ${car.year} — купить в ${car.city} | АВТОWAY`;
  const description =
    car.seoDescription ||
    `${car.title} ${car.year} года в продаже с проверкой АВТОWAY. Пробег ${car.mileageKm.toLocaleString("ru-RU")} км, ${TRANSMISSION_LABEL[car.transmission] ?? car.transmission}, ${FUEL_LABEL[car.fuel] ?? car.fuel}. Цена $${car.priceUsd.toLocaleString("ru-RU")}.`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/services/sell/${car.slug}` },
    openGraph: {
      title,
      description,
      url: `/services/sell/${car.slug}`,
      type: "website",
      images: [{ url: car.mainPhoto || "/opengraph-image.jpg", alt: car.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [car.mainPhoto || "/opengraph-image.jpg"] },
  };
}

export default async function SaleCarPage({ params }: Props) {
  const { slug } = await params;
  const [car, contact] = await Promise.all([getCar(slug), getPrismaClient().contact.findFirst()]);
  if (!car || !car.isActive || car.status === "draft") notFound();

  const usdRate = await getUsdRate();
  const all = await repo().getAll({ limit: 12 });
  const similar = all
    .filter(item => item.id !== car.id)
    .sort((a, b) => {
      const score = (x: SaleCar) =>
        (x.brandSlug === car.brandSlug ? 2 : 0) +
        (x.bodyType === car.bodyType ? 1 : 0) -
        Math.abs(x.priceUsd - car.priceUsd) / Math.max(car.priceUsd, 1);
      return score(b) - score(a);
    })
    .slice(0, 3);

  void repo().incrementViews(car.id);

  const featureGroups = saleFeatureGroups(car.features);
  const condition = SALE_CONDITION_LABEL[car.condition] ?? car.condition;
  const title = car.title;

  return (
    <div className="min-h-screen bg-zinc-950 pb-28 lg:pb-20">
      <SaleStructuredData car={car} usdRate={usdRate} />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Продажа авто", href: "/services/sell" },
          { label: car.brand ?? title },
          { label: title },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
        <PageBreadcrumbs
          className="mb-4"
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/services" },
            { label: "Продажа авто", href: "/services/sell" },
            { label: title },
          ]}
        />
        <Link href="/services/sell" className="mb-5 inline-flex text-sm text-zinc-500 transition hover:text-white">
          ← Назад в каталог
        </Link>

        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full border px-2.5 py-1 font-medium ${SALE_STATUS_STYLE[car.status] ?? SALE_STATUS_STYLE.available}`}>
              {SALE_STATUS_LABEL[car.status] ?? car.status}
            </span>
            <span className="text-zinc-500">📍 {car.city}</span>
            <span className="text-zinc-600">Код: {car.slug.slice(-8).toUpperCase()}</span>
            {car.isInspected && <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-red-300">Проверено АВТОWAY</span>}
            {car.originalPaint && <span className="text-emerald-400">В родной краске</span>}
            {car.isNegotiable && <span className="text-zinc-400">Возможен торг</span>}
            {car.allowExchange && <span className="text-sky-400">Trade-in</span>}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {car.title}, {car.year} г. в {car.city}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {car.generation && `${car.generation} · `}
            {car.mileageKm.toLocaleString("ru-RU")} км · {TRANSMISSION_LABEL[car.transmission] ?? car.transmission} · {FUEL_LABEL[car.fuel] ?? car.fuel}
            {car.enginePowerHp ? ` · ${car.enginePowerHp} л.с.` : ""}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            <SaleGallery photos={car.photos} videoUrl={car.videoUrl} title={car.title} />

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KeySpec label="Год" value={`${car.year} г.`} />
              <KeySpec label="Пробег" value={`${car.mileageKm.toLocaleString("ru-RU")} км`} />
              <KeySpec label="Двигатель" value={car.engineVolume ? `${car.engineVolume.toFixed(1)} л` : FUEL_LABEL[car.fuel] ?? "—"} hint={car.enginePowerHp ? `${car.enginePowerHp} л.с.` : undefined} />
              <KeySpec label="Коробка" value={TRANSMISSION_LABEL[car.transmission] ?? car.transmission} />
              <KeySpec label="Привод" value={DRIVE_TYPE_LABEL[car.driveType] ?? car.driveType} />
              <KeySpec label="Кузов" value={BODY_TYPE_LABEL[car.bodyType] ?? car.bodyType} hint={car.color ?? undefined} />
              <KeySpec label="Салон" value={INTERIOR_MATERIAL_LABEL[car.interiorMaterial ?? ""] ?? "—"} hint={INTERIOR_COLOR_LABEL[car.interiorColor ?? ""] ?? undefined} />
              <KeySpec label="Состояние" value={condition} hint={car.ownersCount ? `${car.ownersCount} влад.` : undefined} />
            </section>

            {(car.isInspected || car.expertSummary || car.bodyCheckNote || car.techCheckNote || car.legalCheckNote) && (
              <section className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/25 via-zinc-900/50 to-zinc-950 p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Заключение эксперта</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">Отчёт проверки АВТОWAY</h2>
                  </div>
                  {car.diagnosticsPdf && (
                    <a href={car.diagnosticsPdf} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500">
                      Открыть диагностику
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                  {car.vinVerified && <Badge>✓ VIN проверен</Badge>}
                  <Badge>✓ Юридически чист</Badge>
                  <Badge>✓ Кузов проверен</Badge>
                  <Badge>✓ Компьютерная диагностика</Badge>
                </div>
                {car.expertSummary && (
                  <p className="mt-5 border-l-2 border-red-500/50 pl-4 text-sm leading-relaxed text-zinc-300">
                    {car.expertSummary}
                  </p>
                )}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {car.bodyCheckNote && <CheckNote title="Кузов и ЛКП" text={car.bodyCheckNote} />}
                  {car.techCheckNote && <CheckNote title="Двигатель, КПП, подвеска" text={car.techCheckNote} />}
                  {car.legalCheckNote && <CheckNote title="Юридическая чистота" text={car.legalCheckNote} />}
                </div>
              </section>
            )}

            <section>
              <h2 className="mb-4 text-xl font-bold text-white">Технические характеристики</h2>
              <div className="overflow-hidden rounded-2xl border border-zinc-800">
                <SpecGroup title="Общая информация" rows={[
                  ["Марка", car.brand],
                  ["Модель", car.model],
                  ["Поколение", car.generation],
                  ["Год выпуска", `${car.year}`],
                  ["Пробег", `${car.mileageKm.toLocaleString("ru-RU")} км`],
                  ["Состояние", condition],
                  ["Страна происхождения", car.originCountry],
                  ["Растаможен", car.customsCleared ? "Да" : "Нет"],
                  ["Количество владельцев", car.ownersCount],
                  ["VIN", car.vin],
                ]} />
                <SpecGroup title="Двигатель и трансмиссия" rows={[
                  ["Тип топлива", FUEL_LABEL[car.fuel] ?? car.fuel],
                  ["Объём двигателя", car.engineVolume ? `${car.engineVolume.toFixed(1)} л` : undefined],
                  ["Мощность", car.enginePowerHp ? `${car.enginePowerHp} л.с.` : undefined],
                  ["Коробка передач", TRANSMISSION_LABEL[car.transmission] ?? car.transmission],
                  ["Привод", DRIVE_TYPE_LABEL[car.driveType] ?? car.driveType],
                ]} />
                <SpecGroup title="Кузов и салон" rows={[
                  ["Тип кузова", BODY_TYPE_LABEL[car.bodyType] ?? car.bodyType],
                  ["Количество дверей", car.doors ? `${car.doors}` : undefined],
                  ["Количество мест", car.seats ? `${car.seats}` : undefined],
                  ["Цвет кузова", car.color],
                  ["Материал салона", INTERIOR_MATERIAL_LABEL[car.interiorMaterial ?? ""] ?? car.interiorMaterial],
                  ["Цвет салона", INTERIOR_COLOR_LABEL[car.interiorColor ?? ""] ?? car.interiorColor],
                  ["Руль", car.steering === "right" ? "Правый" : "Левый"],
                ]} />
                {car.customSpecs.length > 0 && (
                  <SpecGroup title="Дополнительные характеристики" rows={car.customSpecs.map(item => [item.label, item.value])} />
                )}
              </div>
            </section>

            {car.description && (
              <section>
                <h2 className="mb-3 text-xl font-bold text-white">Описание автомобиля</h2>
                <div className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
                  {car.description}
                </div>
              </section>
            )}

            {(featureGroups.length > 0 || car.features.length > 0) && (
              <section>
                <h2 className="mb-4 text-xl font-bold text-white">Комплектация</h2>
                {featureGroups.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {featureGroups.map(group => (
                      <div key={group.title} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                        <p className="mb-2 text-sm font-semibold text-white">{group.title}</p>
                        <ul className="space-y-1.5">
                          {group.items.map(item => <li key={item} className="flex gap-2 text-xs text-zinc-400"><span className="text-emerald-400">✓</span>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {car.features.map(feature => <span key={feature} className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">✓ {feature}</span>)}
                  </div>
                )}
              </section>
            )}

            {similar.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Похожие автомобили</h2>
                  <Link href="/services/sell" className="text-sm text-red-400 hover:text-red-300">Весь каталог →</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {similar.map(item => <SaleCard key={item.id} car={item} usdRate={usdRate} currency="BYN" />)}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <SaleContactCard
              car={car}
              usdRate={usdRate}
              fallbackPhone={contact?.phone ?? undefined}
              telegram={contact?.telegram ?? undefined}
              whatsapp={contact?.whatsapp ?? undefined}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function KeySpec({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-tight text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] text-zinc-500">{hint}</p>}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{children}</span>;
}

function CheckNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-xs font-semibold text-white">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{text}</p>
    </div>
  );
}

function SpecGroup({ title, rows }: { title: string; rows: Array<[string, string | undefined | null]> }) {
  const visible = rows.filter(([, value]) => Boolean(value));
  if (visible.length === 0) return null;
  return (
    <div className="border-b border-zinc-800 last:border-0">
      <p className="bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</p>
      <dl>
        {visible.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-t border-zinc-800/60 px-4 py-2.5 text-sm odd:bg-zinc-900/20">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
