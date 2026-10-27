import { notFound } from "next/navigation";
import Link from "next/link";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import { getPriceLabel, getPeriodPrices, formatPrice, type RentPricingTier } from "@/shared/lib/price";
import { TRANSMISSION_LABEL, FUEL_LABEL } from "@/shared/lib/car-dictionaries";
import { telegramHandle, telegramUrl } from "@/shared/lib/social";
import PhotoGallery from "@/shared/ui/photo-gallery";
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: "Авто не найдено" };
  return { title: `${car.name} — Аренда | АВТОWAY`, description: car.description ?? "" };
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
  const usdRate = await getUsdRate();
  const tiers = await getPricingTiers();
  const isTaxi = car.rentType?.slug === "taxi";
  const priceLabel = getPriceLabel(car);
  const priceAmount = priceLabel ? parseInt(priceLabel.replace(/\D/g, "")) : null;
  const heroUsd = usdRate && priceAmount ? Math.round(priceAmount / usdRate) : null;
  const periodPrices = !isTaxi && car.priceDay != null ? getPeriodPrices(car.priceDay, tiers) : null;
  const conditions = (car.conditions ?? []).filter((c: any) => c.condition?.name);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Breadcrumbs + back */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/" className="hover:text-white transition">Главная</Link>
          <span>/</span>
          <Link href="/services" className="hover:text-white transition">Услуги</Link>
          <span>/</span>
          <Link href="/services/rent" className="hover:text-white transition">Аренда</Link>
          <span>/</span>
          <span className="text-zinc-400">{car.name}</span>
        </div>
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
          <PhotoGallery photos={photos} mainPhoto={mainPhoto} />
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

      {/* Contact */}
      {contact && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16">
          <ContactBlock contact={contact} />
        </section>
      )}
    </div>
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
