import Reveal from "@/shared/ui/reveal";
import HeroBackground from "@/features/home/ui/hero-background";
import { IconYouTube } from "@/shared/ui/icons";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
            АВТО<span className="text-primary">WAY</span>
          </h1>
        </Reveal>
        <Reveal delay={150}>
          <p className="mb-6 text-lg text-zinc-400 sm:text-xl">
            Нам можно верить! Делаю то, что не делают другие
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p className="mb-10 text-sm text-zinc-500">
            Аренда · Автоподбор · Продажа · Эвакуатор · Автосервис — Минск и вся Беларусь
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contacts"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-95"
            >
              Оставить заявку
            </Link>
            <a
              href="#tasks"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-8 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
            >
              Выбрать услугу
            </a>
          </div>
        </Reveal>
        <Reveal delay={450}>
          <a
            href="https://youtube.com/@avtoway"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            <IconYouTube className="size-4" />
            Смотреть видео на YouTube
          </a>
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
