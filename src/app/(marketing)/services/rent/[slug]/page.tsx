import { notFound } from "next/navigation";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { getUsdRate } from "@/shared/lib/exchange-rate";
import { getPriceRows } from "@/shared/lib/price";
import PhotoGallery from "@/shared/ui/photo-gallery";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }> }

const TRANSMISSION_LABEL: Record<string, string> = {
  auto: "Автомат", manual: "Механика", robot: "Робот", variator: "Вариатор",
};
const FUEL_LABEL: Record<string, string> = {
  gasoline: "Бензин", diesel: "Дизель", electric: "Электро", hybrid: "Гибрид",
  propane: "Газ (пропан)", methane: "Газ (метан)",
};

async function getCar(slug: string) {
  const db = getPrismaClient();
  return db.rentCar.findUnique({
    where: { slug, isActive: true },
    include: { rentType: true },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: "Авто не найдено" };
  return { title: `${car.name} — Аренда | АВТОWAY`, description: car.description ?? "" };
}

export default async function RentCarDetailPage({ params }: Props) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) notFound();

  const photos = (car.photos ?? "").split(",").filter(Boolean);
  const features = (car.features ?? "").split(",").filter(Boolean);
  const mainPhoto = car.mainPhoto ?? photos[0];
  const priceRows = getPriceRows(car);
  const usdRate = await getUsdRate();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Breadcrumbs + back */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-24 pb-2">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <a href="/" className="hover:text-white transition">Главная</a>
          <span>/</span>
          <a href="/services" className="hover:text-white transition">Услуги</a>
          <span>/</span>
          <a href="/services/rent" className="hover:text-white transition">Аренда</a>
          <span>/</span>
          <span className="text-zinc-400">{car.name}</span>
        </div>
        <a href="/services/rent"
          className="mt-3 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-white transition">
          ← Назад к списку
        </a>
      </div>

      {/* Title + price row (before photos) */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{car.name}</h1>
            {car.rentType && (
              <span className="mt-2 inline-block rounded bg-red-600/20 px-2.5 py-0.5 text-sm font-medium text-red-400">
                {car.rentType.name}
              </span>
            )}
          </div>
          {priceRows.length > 0 && <PriceHero priceRow={priceRows[0]!} usdRate={usdRate} />}
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

          {/* All prices */}
          {priceRows.length > 0 && (
            <div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-white">Все цены</h2>
                <div className="mt-4 space-y-3">
                  {priceRows.map((r, i) => {
                    const usdVal = usdRate ? Math.round(parseInt(r.value.replace(/\D/g, "")) / usdRate) : null;
                    return (
                      <div key={i} className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
                        <div>
                          <span className="text-sm text-zinc-400">{r.label}</span>
                          {usdVal && <p className="text-[10px] text-zinc-600">≈ ${usdVal.toLocaleString()}</p>}
                        </div>
                        <span className="text-base font-bold text-green-400">{r.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
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

function PriceHero({ priceRow, usdRate }: { priceRow: { label: string; value: string }; usdRate: number | null }) {
  const usdVal = usdRate ? Math.round(parseInt(priceRow.value.replace(/\D/g, "")) / usdRate) : null;
  return (
    <div className="flex shrink-0 items-baseline gap-3 rounded-xl border border-green-800/50 bg-green-950/20 px-5 py-3 sm:flex-col sm:items-end">
      <p className="text-sm text-zinc-500">от</p>
      <p className="text-2xl font-bold text-green-400 sm:text-3xl">{priceRow.value}</p>
      {usdVal && <p className="text-xs text-zinc-500">≈ ${usdVal.toLocaleString()}</p>}
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-base font-bold text-green-400">{value}</span>
    </div>
  );
}
