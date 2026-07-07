import { getChannelVideos } from "@/lib/youtube";
import VideoCarousel from "@/components/video-carousel";
import Reveal from "@/components/reveal";
import HeroBackground from "@/components/hero-background";
import ScrollProgress from "@/components/scroll-progress";
import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";

const services = [
  {
    title: "Видеообзоры",
    desc: "Профессиональные обзоры и тест-драйвы автомобилей",
    icon: "▶",
  },
  {
    title: "Консультации",
    desc: "Помощь в выборе и проверке авто перед покупкой",
    icon: "✕",
  },
  {
    title: "Аренда авто",
    desc: "Скоро — аренда автомобилей для любых целей",
    icon: "◉",
  },
];

export default async function Home() {
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? "";
  const videos = channelId ? await getChannelVideos(channelId, 15) : [];
  return (
    <>
      <ScrollProgress />
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SiteLogo />
          <MainNav />
        </div>
      </header>

      <main>
        <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
          <HeroBackground videoId="urBpYKOYkeI" />
          <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-7xl">
                АВТО<span className="text-primary">WAY</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mb-10 text-lg text-zinc-400 sm:text-xl">
                Делаю то, что не делают другие! Обзоры, ремонты, лайфхаки и всё, что связано с авто
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <a
                  href="https://youtube.com/@avtoway"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  Смотреть видео
                </a>
                <a
                  href="#services"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-8 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
                >
                  Наши услуги
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

        <section
          id="about"
          className="border-t border-zinc-800/50 py-32"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <h2 className="mb-6 text-3xl font-bold text-white">О проекте</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="text-lg leading-relaxed text-zinc-400">
                АВТОWAY — проект про автомобили, где я показываю всё как есть.
                Честные обзоры, ремонты, лайфхаки и полезные услуги —
                я делаю то, что не делают другие. Никакой фальши, никаких
                продюсеров — только реальный опыт и живые проекты.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <div className="mt-8">
                <a
                  href="/about"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
                >
                  Подробнее о проекте
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="videos"
          className="border-t border-zinc-800/50 bg-zinc-900/30 py-32"
        >
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="mb-14 text-center text-3xl font-bold text-white">
                Последние видео
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <VideoCarousel videos={videos} />
            </Reveal>
          </div>
        </section>

        <section id="services" className="border-t border-zinc-800/50 py-32">
          <div className="mx-auto max-w-5xl px-6">
            <Reveal>
              <h2 className="mb-14 text-center text-3xl font-bold text-white">
                Наши услуги
              </h2>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-3">
              {services.map((service, i) => (
                <Reveal key={service.title} delay={150 * (i + 1)}>
                  <div className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:border-zinc-700 hover:bg-zinc-800/50 hover:shadow-lg">
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10">
                      <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {service.icon}
                      </span>
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        {service.title}
                      </h3>
                      <p className="text-zinc-400">{service.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-800/50 py-10">
        <div className="mx-auto max-w-5xl px-6 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} АВТОWAY. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}
