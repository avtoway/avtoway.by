import Reveal from "@/shared/ui/reveal";
import HeroBackground from "@/features/home/ui/hero-background";
import { IconYouTube } from "@/shared/ui/icons";
import Link from "next/link";
import { getActiveServices } from "@/shared/lib/active-services.server";

export default async function HeroSection() {
  // Список услуг берём из БД: скрытые услуги не должны рекламироваться в hero.
  const services = await getActiveServices();
  const hasServices = services.length > 0;

  return (
    <section className="relative flex min-h-[92dvh] items-center justify-center overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-28 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Честно об автомобилях
          </span>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            АВТО
            <span className="animate-text-shimmer bg-gradient-to-r from-primary via-red-300 to-primary bg-clip-text text-transparent">
              WAY
            </span>
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-300 sm:text-lg">
            Нам можно верить. Делаю то, что не делают другие — честно, с договором и понятной ценой.
          </p>
        </Reveal>

        {hasServices && (
          <Reveal delay={260}>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {services.slice(0, 5).map(service => (
                <a
                  key={service.slug}
                  href={service.href}
                  className="group inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-red-500/40 hover:text-white"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full transition group-hover:scale-150"
                    style={{ backgroundColor: service.color }}
                  />
                  {service.title}
                </a>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={340}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/contacts"
              className="animate-glow inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              Оставить заявку
            </Link>
            {hasServices && (
              <a
                href="#tasks"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-8 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
              >
                Выбрать услугу
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={440}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span>Минск и вся Беларусь</span>
            <span className="text-zinc-700" aria-hidden="true">·</span>
            <a
              href="https://youtube.com/@avtoway"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-zinc-300"
            >
              <IconYouTube className="size-4" />
              Смотреть видео
            </a>
          </div>
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="h-10 w-6 animate-bounce rounded-full border border-zinc-700 p-1">
          <div className="mx-auto h-2 w-1.5 rounded-full bg-zinc-500" />
        </div>
      </div>
    </section>
  );
}
