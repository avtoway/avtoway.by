import Image from "next/image";
import Link from "next/link";
import type { AutoPodborFeature, AutoPodborSettings, AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import { phoneHref } from "../lib/defaults";
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
}: {
  settings: AutoPodborSettings;
  tariffs: AutoPodborTariff[];
  trust: AutoPodborFeature[];
}) {
  const single = tariffs.find(t => t.slug === "single-check");
  const turnkey = tariffs.find(t => t.slug === "turnkey");
  const singlePrice = single ? tariffPrice(single) : null;
  const turnkeyPrice = turnkey ? tariffPrice(turnkey) : null;
  const tel = phoneHref(settings.phone);
  const secondaryHref = tel ?? "#tariffs";
  const secondaryLabel = tel ? settings.ctaSecondaryLabel || "Позвонить" : "Тарифы";

  return (
    <section className="relative overflow-hidden border-b border-zinc-800/50 pt-24 pb-12 sm:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_15%,rgba(239,68,68,0.12),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="max-w-xl">
            <nav aria-label="Хлебные крошки" className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
              <Link href="/" className="transition hover:text-white">Главная</Link>
              <span>/</span>
              <Link href="/services" className="transition hover:text-white">Услуги</Link>
              <span>/</span>
              <span className="text-zinc-400">Автоподбор</span>
            </nav>

            {settings.heroBadge && (
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {settings.heroBadge}
              </span>
            )}

            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl xl:text-6xl">
              {withHighlight(settings.heroTitle, settings.heroHighlight)}
            </h1>

            {settings.heroSubtitle && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {settings.heroSubtitle}
              </p>
            )}

            {(singlePrice || turnkeyPrice) && (
              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-300">
                {singlePrice && <span>Осмотр — <strong className="text-white">{singlePrice}</strong></span>}
                {singlePrice && turnkeyPrice && <span className="h-1 w-1 rounded-full bg-zinc-700" />}
                {turnkeyPrice && <span>Подбор — <strong className="text-white">{turnkeyPrice}</strong></span>}
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#lead"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                {settings.ctaPrimaryLabel}
                <AutoIcon name="arrow-right" className="h-4 w-4" />
              </a>
              <a
                href={secondaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-8 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white active:scale-[0.98]"
              >
                <AutoIcon name={tel ? "phone" : "arrow-right"} className="h-4 w-4" />
                {secondaryLabel}
              </a>
            </div>

            {trust.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {trust.slice(0, 3).map(item => (
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

          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_40%,rgba(239,68,68,0.18),transparent_65%)]" />
              <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:32px_32px]" />

              <AutoIcon name="car" className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 text-zinc-600" />
              <div className="absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-950/80 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur-md">
                <AutoIcon name="shield" className="h-3.5 w-3.5 text-primary" />
                24 параметра
              </span>
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/70 bg-zinc-950/80 px-3 py-1.5 text-[11px] text-zinc-300 backdrop-blur-md">
                <AutoIcon name="check" className="h-3.5 w-3.5 text-green-400" />
                Документы
              </span>

              <span className="absolute left-4 top-[42%] inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] text-zinc-400">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                Кузов
              </span>
              <span className="absolute right-4 top-[38%] inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] text-zinc-400">
                <span className="h-1 w-1 rounded-full bg-green-400" />
                Двигатель
              </span>
              <span className="absolute right-4 top-[58%] inline-flex items-center gap-1.5 rounded-full bg-zinc-900/90 px-2.5 py-1 text-[10px] text-zinc-400">
                <span className="h-1 w-1 rounded-full bg-amber-400" />
                Пробег
              </span>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-950/80 p-1.5 pr-3 backdrop-blur-md">
                <Image
                  src="/images/avatar.jpg"
                  width={32}
                  height={32}
                  alt="Виктор, эксперт АВТОWAY"
                  sizes="32px"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-[11px] leading-tight text-zinc-300">
                  <span className="block font-medium text-white">Виктор</span>
                  эксперт АВТОWAY
                </span>
              </div>

              <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-red-500/10 px-3 py-1.5 text-[11px] text-primary backdrop-blur-md">
                <AutoIcon name="check" className="h-3.5 w-3.5" />
                30 дней
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
