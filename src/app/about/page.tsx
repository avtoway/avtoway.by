"use client";

import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";
import ScrollProgress from "@/components/scroll-progress";
import Reveal from "@/components/reveal";

const socials = [
  { label: "YouTube", href: "https://youtube.com/@avtoway", color: "#ef4444" },
  { label: "Instagram", href: "#", color: "#ec4899" },
  { label: "Telegram", href: "#", color: "#38bdf8" },
  { label: "VK", href: "#", color: "#3b82f6" },
];

const milestones = [
  {
    year: "2020",
    title: "Первый шаг",
    text: "Купил Daewoo Lanos. Просто чтобы было. А оказалось — начало пути. Начал разбираться, копаться, понимать как устроен автомобиль.",
  },
  {
    year: "2022",
    title: "Dacia Logan — первый серьёзный проект",
    text: "Приобрёл Logan 2007 на 1.4 бензине. Все говорили — скучная машина. А я заварил днище, переварил заднюю часть. До этого никогда ничего такого не делал. Это мой первый настоящий проект. И он ещё не закончен — в планах турбо, тормоза, подвеска, внешка.",
  },
  {
    year: "2024",
    title: "YouTube — АВТОWAY",
    text: "Запустил канал. Начал снимать обзоры, ремонты, лайфхаки. Не ради хайпа — ради дела. Показал Logan, его восстановление, свои ошибки и победы.",
  },
  {
    year: "2025",
    title: "Hyundai Accent — эксперимент",
    text: "Купил Accent 1998 года, чтобы делать то, что не делают другие. Было страшно — но я сделал. Продал, пошёл дальше. Этот проект научил главному — не бояться.",
  },
  {
    year: "2026",
    title: "АВТОWAY — бренд",
    text: "Запускаю проект как полноценный бренд. Первые услуги: аренда авто под такси, автоподбор, помощь в продаже. Я не прячусь за вывеской — свечу лицом, показываю каждый шаг.",
  },
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
            <div className="absolute -left-40 -top-40 h-96 w-96 animate-gradient rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute -right-40 -bottom-40 h-96 w-96 animate-gradient rounded-full bg-blue-500/5 blur-3xl" style={{ animationDelay: "-5s" }} />
          </div>
          <div className="relative mx-auto max-w-4xl px-6">
            <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
              <div className="shrink-0">
                <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/50 text-zinc-600 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 sm:h-44 sm:w-44">
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
              <h2 className="mb-8 text-3xl font-bold text-white">
                Кто я и почему вам можно верить
              </h2>
            </Reveal>
            <div className="space-y-6 text-zinc-400 leading-relaxed">
              <Reveal delay={100}>
                <p>
                  Я не строитель бизнеса в гараже. Я человек, который всю жизнь живёт
                  автомобилями. Не как все — я вижу в них не просто железки. Я вижу
                  боль, страдания, ошибки предыдущих владельцев. И я знаю, как это
                  исправить.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p>
                  YouTube для меня — не хайп. Это мотивация. Это то, что заставляет
                  меня браться за проекты, которые другие обходят стороной. Logan,
                  который все назвали скучным — я заварил ему днище, переварил
                  заднюю часть, хотя до этого никогда этим не занимался. Accent
                  1998 года — я боялся, но купил и сделал.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <p>
                  Я не прячусь. Я свечу лицом, своими машинами, своей жизнью.
                  Каждый проект — на видео. Каждая ошибка — на виду.
                  <span className="text-primary font-medium"> Нам можно верить.</span>
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 py-24">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal>
              <h2 className="mb-16 text-3xl font-bold text-white">История</h2>
            </Reveal>
            <div className="relative">
              <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-px bg-gradient-to-b from-primary/50 via-zinc-700 to-zinc-800" />
              {milestones.map((m, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="group relative flex gap-8 pb-14 last:pb-0">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-xs font-bold text-zinc-500 shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-125 group-hover:border-primary group-hover:text-primary group-hover:shadow-primary/20">
                      {m.year.slice(2)}
                    </div>
                    <div className="pt-1.5 transition-all duration-300 group-hover:translate-x-1">
                      <span className="mb-1 block text-xs font-medium tracking-wider uppercase transition-colors duration-300 text-zinc-600 group-hover:text-primary">
                        {m.year}
                      </span>
                      <h3 className="mb-2 text-base font-semibold text-zinc-300 transition-colors duration-300 group-hover:text-white">
                        {m.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-500 transition-colors duration-300 group-hover:text-zinc-300">
                        {m.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-800/50 bg-zinc-900/20 py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <h2 className="mb-8 text-3xl font-bold text-white">Мои ресурсы</h2>
            </Reveal>
            <Reveal delay={100}>
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
                    className="group inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-400 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      transitionProperty: "transform, box-shadow, border-color, color, background",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = s.color;
                      e.currentTarget.style.color = s.color;
                      e.currentTarget.style.boxShadow = `0 10px 40px ${s.color}20, 0 4px 12px rgba(0,0,0,0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.boxShadow = "";
                    }}
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
