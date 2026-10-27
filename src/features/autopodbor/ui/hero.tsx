import Image from "next/image";
import Link from "next/link";
import AnimatedCounter from "@/shared/ui/animated-counter";
import type { AutoPodborFeature, AutoPodborSettings, AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import { tariffPrice } from "../lib/parse";
import AutoIcon from "./icon";

function withHighlight(text: string, highlight?: string) {
  if (!highlight) return text;
  const index = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (index === -1) return text;
  return (
    <>
      {text.slice(0, index)}
      <span className="text-primary">{text.slice(index, index + highlight.length)}</span>
      {text.slice(index + highlight.length)}
    </>
  );
}

export default function Hero({
  settings,
  tariffs,
  trust,
  hasImage,
}: {
  settings: AutoPodborSettings;
  tariffs: AutoPodborTariff[];
  trust: AutoPodborFeature[];
  hasImage: boolean;
}) {
  const single = tariffs.find(t => t.slug === "single-check");
  const turnkey = tariffs.find(t => t.slug === "turnkey");
  const singlePrice = single ? tariffPrice(single) : null;
  const turnkeyPrice = turnkey ? tariffPrice(turnkey) : null;

  const showImage = hasImage && settings.heroImage;

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/50 pt-28 pb-14 sm:pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_20%,rgba(239,68,68,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/" className="transition hover:text-white">Главная</Link>
          <span>/</span>
          <Link href="/services" className="transition hover:text-white">Услуги</Link>
          <span>/</span>
          <span className="text-zinc-400">Автоподбор</span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Text */}
          <div>
            {settings.heroBadge && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {settings.heroBadge}
              </span>
            )}

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {withHighlight(settings.heroTitle, settings.heroHighlight)}
            </h1>

            {settings.heroSubtitle && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {settings.heroSubtitle}
              </p>
            )}

            {(singlePrice || turnkeyPrice) && (
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {singlePrice && (
                  <span className="text-zinc-300">
                    Разовый осмотр — <strong className="font-semibold text-white">{singlePrice}</strong>
                  </span>
                )}
                {singlePrice && turnkeyPrice && <span className="h-1 w-1 rounded-full bg-zinc-700" />}
                {turnkeyPrice && (
                  <span className="text-zinc-300">
                    Подбор под ключ — <strong className="font-semibold text-white">{turnkeyPrice}</strong>
                  </span>
                )}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                {settings.ctaPrimaryLabel}
                <AutoIcon name="arrow-right" className="h-4 w-4" />
              </a>
              <a
                href="#tariffs"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-8 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                {settings.ctaSecondaryLabel}
              </a>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Консультация бесплатна. Отвечаем в течение 15 минут в рабочее время.
            </p>

            {trust.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {trust.map(item => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-[11px] text-zinc-400"
                  >
                    <AutoIcon name={item.icon} className="h-3.5 w-3.5 text-primary" />
                    {item.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 sm:aspect-[16/11] lg:aspect-[4/3]">
              {showImage ? (
                <Image
                  src={settings.heroImage as string}
                  alt={settings.heroImageAlt || settings.heroTitle}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_70%_30%,rgba(239,68,68,0.18),transparent_65%)]">
                  <div
                    className="absolute inset-0 opacity-[0.18]"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                      backgroundSize: "44px 44px",
                    }}
                  />
                  <AutoIcon name="car" className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 text-zinc-700/70" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950/90 to-transparent" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

              {/* Floating facts */}
              <div className="absolute left-4 top-4 rounded-xl border border-zinc-700/70 bg-zinc-950/80 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <AutoIcon name="document" className="h-4 w-4 text-primary" />
                  Отчёт: 150+ фото и видео
                </div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-xl border border-zinc-700/70 bg-zinc-950/80 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <AutoIcon name="shield" className="h-4 w-4 text-green-400" />
                  Проверено: 100+ параметров
                </div>
              </div>
              {settings.avgSavings != null && settings.avgSavings > 0 && (
                <div className="absolute bottom-4 left-4 rounded-xl border border-zinc-700/70 bg-zinc-950/80 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <AutoIcon name="scale" className="h-4 w-4 text-amber-400" />
                    Средний торг: −{settings.avgSavings.toLocaleString("ru-RU")} BYN
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {(settings.yearsExperience || settings.carsChecked || settings.citiesCount || settings.guaranteeDays) && (
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-zinc-800/60 pt-10 sm:grid-cols-4">
            {!!settings.yearsExperience && <AnimatedCounter value={settings.yearsExperience} label="лет опыта" suffix="+" />}
            {!!settings.carsChecked && <AnimatedCounter value={settings.carsChecked} label="авто проверено" suffix="+" />}
            {!!settings.citiesCount && <AnimatedCounter value={settings.citiesCount} label="городов" />}
            {!!settings.guaranteeDays && <AnimatedCounter value={settings.guaranteeDays} label="дней гарантии" />}
          </div>
        )}
      </div>
    </section>
  );
}
