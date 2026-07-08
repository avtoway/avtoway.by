import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";
import ScrollProgress from "@/components/scroll-progress";

const socials = [
  { label: "YouTube", href: "https://youtube.com/@avtoway", color: "hover:text-red-500", icon: "yt" },
  { label: "Instagram", href: "#", color: "hover:text-pink-400", icon: "ig" },
  { label: "Telegram", href: "#", color: "hover:text-sky-400", icon: "tg" },
  { label: "VK", href: "#", color: "hover:text-blue-400", icon: "vk" },
];

const milestones = [
  { year: "2020", text: "Купил свой первый проект — Daewoo Lanos. Начал разбираться в устройстве авто." },
  { year: "2022", text: "Приобрёл Dacia Logan 2007. Начал восстановление: переварил заднюю часть и днище. Первый серьёзный проект." },
  { year: "2024", text: "Запустил YouTube канал АВТОWAY. Начал снимать обзоры, ремонты и лайфхаки." },
  { year: "2025", text: "Купил Hyundai Accent 1998 — проект для экспериментов. Испытал страх, но сделал." },
  { year: "2026", text: "Запускаю АВТОWAY как бренд. Первые услуги: аренда авто, автоподбор, помощь в продаже." },
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
        <section className="border-t border-zinc-800/50 pt-32 pb-24">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              О проекте
            </h1>
            <p className="text-lg leading-relaxed text-zinc-400">
              АВТОWAY — личный бренд и проекты про автомобили, где я показываю всё как есть.
              Честные обзоры, ремонты, лайфхаки и полезные услуги.
              Я делаю то, что не делают другие. Я делаю то, что нужно Вам.
            </p>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-12 text-3xl font-bold text-white">История</h2>
            <div className="relative space-y-0">
              <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-px bg-zinc-800" />
              {milestones.map((m, i) => (
                <div key={i} className="relative flex gap-8 pb-12 last:pb-0">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-500">
                    {m.year.slice(2)}
                  </div>
                  <div className="pt-1.5">
                    <span className="mb-1 block text-xs font-medium tracking-wider text-zinc-600 uppercase">{m.year}</span>
                    <p className="text-zinc-300 leading-relaxed">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-8 text-3xl font-bold text-white">Мои ресурсы</h2>
            <p className="mb-12 text-zinc-400">
              Следите за проектами и развитием бренда в социальных сетях
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-800/80 ${s.color}`}
                >
                  {s.label}
                </a>
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
