import Link from "next/link";
import { getChannelVideos } from "@/lib/youtube";
import VideoCarousel from "@/components/video-carousel";

const services = [
  { title: "Видеообзоры", desc: "Профессиональные обзоры автомобилей" },
  { title: "Консультации", desc: "Помощь в выборе авто" },
  { title: "Аренда авто", desc: "Скоро — аренда автомобилей" },
];

export default async function Home() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "";
  const videos = channelId ? await getChannelVideos(channelId, 15) : [];
  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            АВТО<span className="text-primary">WAY</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#about" className="transition-colors hover:text-white">
              О нас
            </a>
            <a href="#videos" className="transition-colors hover:text-white">
              Видео
            </a>
            <a
              href="#services"
              className="transition-colors hover:text-white"
            >
              Услуги
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_60%)] opacity-15" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--color-secondary)_0%,_transparent_50%)] opacity-30" />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
              АВТО<span className="text-primary">WAY</span>
            </h1>
            <p className="mb-8 text-lg text-zinc-400 sm:text-xl">
              Автомобильные обзоры, тест-драйвы и всё, что связано с авто
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="#videos"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Смотреть видео
              </a>
              <a
                href="#services"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-700 px-8 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Наши услуги
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">О проекте</h2>
            <p className="text-lg leading-relaxed text-zinc-400">
              АВТОWAY — это проект про автомобили. Мы снимаем честные обзоры,
              тест-драйвы и полезные видео для тех, кто живёт автотематикой. В
              будущем планируем запустить услуги по подбору авто, консультации и
              аренду автомобилей.
            </p>
          </div>
        </section>

        <section id="videos" className="border-t border-zinc-800 bg-zinc-900/50 py-24">
          <div className="mx-auto max-w-6xl px-8">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Последние видео
            </h2>
            <VideoCarousel videos={videos} />
          </div>
        </section>

        <section id="services" className="border-t border-zinc-800 py-24">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Наши услуги</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-shadow hover:border-zinc-700 hover:shadow-lg"
                >
                  <h3 className="mb-2 text-lg font-semibold">
                    {service.title}
                  </h3>
                  <p className="text-zinc-400">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800 py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} АВТОWAY. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}
