import Link from "next/link";

const videos = [
  {
    title: "Обзор нового авто 2026",
    id: "dQw4w9WgXcQ",
  },
  {
    title: "Тест-драйв: спорткар против внедорожника",
    id: "dQw4w9WgXcQ",
  },
  {
    title: "Тюнинг и доработки своими руками",
    id: "dQw4w9WgXcQ",
  },
];

const services = [
  { title: "Видеообзоры", desc: "Профессиональные обзоры автомобилей" },
  { title: "Консультации", desc: "Помощь в выборе авто" },
  { title: "Аренда авто", desc: "Скоро — аренда автомобилей" },
];

export default function Home() {
  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            AVTO<span className="text-primary">WAY</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#about">О нас</a>
            <a href="#videos">Видео</a>
            <a href="#services">Услуги</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-dvh items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_60%)] opacity-20" />
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
            <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-7xl">
              AVTO<span className="text-primary">WAY</span>
            </h1>
            <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
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
                className="inline-flex h-12 items-center gap-2 rounded-full border border-zinc-300 px-8 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Наши услуги
              </a>
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-zinc-200 py-24 dark:border-zinc-800">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">О проекте</h2>
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              AVTOWAY — это проект про автомобили. Мы снимаем честные обзоры,
              тест-драйвы и полезные видео для тех, кто живёт автотематикой.
              В будущем планируем запустить услуги по подбору авто, консультации
              и аренду автомобилей.
            </p>
          </div>
        </section>

        <section id="videos" className="bg-zinc-50 py-24 dark:bg-zinc-900/50">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Последние видео</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={`https://youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                >
                  <div className="aspect-video bg-zinc-200 dark:bg-zinc-700">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`}
                      alt={video.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{video.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="py-24">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Наши услуги</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="rounded-2xl border border-zinc-200 p-6 transition-shadow hover:shadow-md dark:border-zinc-700"
                >
                  <h3 className="mb-2 text-lg font-semibold">{service.title}</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} AVTOWAY. Все права защищены.</p>
        </div>
      </footer>
    </>
  );
}
