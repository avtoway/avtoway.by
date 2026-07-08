import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";
import ScrollProgress from "@/components/scroll-progress";
import Reveal from "@/components/reveal";

const socials = [
  { label: "YouTube", href: "https://youtube.com/@avtoway", hover: "hover:text-red-500 hover:border-red-500/30 hover:shadow-red-500/10", icon: "yt" },
  { label: "Instagram", href: "#", hover: "hover:text-pink-400 hover:border-pink-400/30 hover:shadow-pink-400/10", icon: "ig" },
  { label: "Telegram", href: "#", hover: "hover:text-sky-400 hover:border-sky-400/30 hover:shadow-sky-400/10", icon: "tg" },
  { label: "VK", href: "#", hover: "hover:text-blue-400 hover:border-blue-400/30 hover:shadow-blue-400/10", icon: "vk" },
];

const milestones = [
  { year: "2020", text: "Купил первый проект — Daewoo Lanos. Начал разбираться в устройстве авто." },
  { year: "2022", text: "Приобрёл Dacia Logan 2007. Начал восстановление: переварил заднюю часть и днище." },
  { year: "2024", text: "Запустил YouTube канал АВТОWAY. Начал снимать обзоры, ремонты и лайфхаки." },
  { year: "2025", text: "Купил Hyundai Accent 1998 — проект для экспериментов. Сделал то, чего боялся." },
  { year: "2026", text: "Запускаю АВТОWAY как бренд. Первые услуги: аренда, подбор, продажа." },
];

export default function AboutPage() {
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
        <section className="relative border-t border-zinc-800/50 overflow-hidden pt-32 pb-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 -top-40 h-80 w-80 animate-gradient rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-6">
            <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-600 backdrop-blur-sm sm:h-44 sm:w-44">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-40"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
              </div>
              <div>
                <Reveal>
                  <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    О проекте
                  </h1>
                </Reveal>
                <Reveal delay={150}>
                  <p className="text-lg leading-relaxed text-zinc-400">
                    АВТОWAY — личный бренд и проекты про автомобили, где я показываю всё как есть.
                    Честные обзоры, ремонты, лайфхаки и полезные услуги.
                    Я делаю то, что не делают другие. Я делаю то, что нужно Вам.
                  </p>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <h2 className="mb-16 text-3xl font-bold text-white">История</h2>
            </Reveal>
            <div className="relative">
              <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-px bg-zinc-800" />
              {milestones.map((m, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="group relative flex gap-8 pb-14 last:pb-0">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-500 transition-all duration-300 group-hover:scale-125 group-hover:border-primary group-hover:text-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                      {m.year.slice(2)}
                    </div>
                    <div className="pt-1.5 transition-all duration-300 group-hover:translate-x-1">
                      <span className="mb-1 block text-xs font-medium tracking-wider text-zinc-600 uppercase transition-colors duration-300 group-hover:text-primary">
                        {m.year}
                      </span>
                      <p className="text-zinc-300 leading-relaxed transition-colors duration-300 group-hover:text-white">
                        {m.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <h2 className="mb-8 text-3xl font-bold text-white">Мои ресурсы</h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mb-12 text-zinc-400">
                Следите за проектами и развитием бренда в социальных сетях
              </p>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-4">
              {socials.map((s, i) => (
                <Reveal key={s.label} delay={200 + i * 80}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-400 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.hover}`}
                  >
                    {s.label}
                  </a>
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
