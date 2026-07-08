"use client";

import { useState } from "react";
import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";
import ScrollProgress from "@/components/scroll-progress";
import Reveal from "@/components/reveal";

const sectionColors = {
  hero: { bg: "rgba(239,68,68,0.12)", border: "#ef4444", name: "красный" },
  story: { bg: "rgba(59,130,246,0.10)", border: "#3b82f6", name: "синий" },
  timeline: { bg: "rgba(245,158,11,0.10)", border: "#f59e0b", name: "жёлтый" },
  social: { bg: "rgba(16,185,129,0.10)", border: "#10b981", name: "зелёный" },
};

const socials = [
  { label: "YouTube", href: "https://youtube.com/@avtoway", color: "#ef4444", border: "hover:border-red-500/40", text: "hover:text-red-400", shadow: "hover:shadow-red-500/20" },
  { label: "Instagram", href: "#", color: "#ec4899", border: "hover:border-pink-500/40", text: "hover:text-pink-400", shadow: "hover:shadow-pink-500/20" },
  { label: "Telegram", href: "#", color: "#38bdf8", border: "hover:border-sky-500/40", text: "hover:text-sky-400", shadow: "hover:shadow-sky-500/20" },
  { label: "VK", href: "#", color: "#3b82f6", border: "hover:border-blue-500/40", text: "hover:text-blue-400", shadow: "hover:shadow-blue-500/20" },
];

const milestones = [
  { year: "2020", title: "Первый шаг", text: "Купил Daewoo Lanos. Просто чтобы было. А оказалось — начало пути. Начал разбираться, копаться, понимать как устроен автомобиль." },
  { year: "2022", title: "Dacia Logan — первый серьёзный проект", text: "Приобрёл Logan 2007 на 1.4 бензине. Все говорили — скучная машина. А я заварил днище, переварил заднюю часть. До этого никогда ничего такого не делал." },
  { year: "2024", title: "YouTube — АВТОWAY", text: "Запустил канал. Начал снимать обзоры, ремонты, лайфхаки. Не ради хайпа — ради дела." },
  { year: "2025", title: "Hyundai Accent — эксперимент", text: "Купил Accent 1998 года, чтобы делать то, что не делают другие. Было страшно — но я сделал." },
  { year: "2026", title: "АВТОWAY — бренд", text: "Запускаю проект как полноценный бренд. Первые услуги: аренда авто под такси, автоподбор, помощь в продаже." },
];

export default function AboutPage() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

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
        <section className="relative overflow-hidden pt-32 pb-24"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${sectionColors.hero.bg}, transparent 70%)` }}>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ef4444] to-transparent opacity-50" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-gradient rounded-full blur-[100px]" style={{ background: `radial-gradient(circle, rgba(239,68,68,0.18), transparent 70%)` }} />
          </div>
          <div className="relative mx-auto max-w-4xl px-6">
            <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
              <div className="group shrink-0">
                <div className="relative h-36 w-36 overflow-hidden rounded-2xl border border-zinc-700 shadow-xl shadow-black/30 transition-all duration-500 group-hover:border-[#ef4444]/50 group-hover:shadow-xl group-hover:shadow-[#ef4444]/20 sm:h-44 sm:w-44">
                  <picture>
                    <source srcSet="/images/avatar.webp" type="image/webp" />
                    <img src="/images/avatar.jpg" alt="АВТОWAY" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </picture>
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
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

        <section className="relative overflow-hidden py-24"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${sectionColors.story.bg}, transparent 70%)` }}>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />
          <div className="relative mx-auto max-w-4xl px-6">
            <Reveal>
              <h2 className="mb-8 text-3xl font-bold text-white group">
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

        <section className="relative overflow-hidden py-24"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${sectionColors.timeline.bg}, transparent 70%)` }}>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f59e0b] to-transparent opacity-50" />
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${sectionColors.timeline.bg}, transparent 70%)` }} />
          </div>
          <div className="relative mx-auto max-w-4xl px-6">
            <Reveal>
              <h2 className="mb-16 text-3xl font-bold text-white">История</h2>
            </Reveal>
            <div className="relative">
              <div className="absolute left-[19px] top-3 h-[calc(100%-24px)] w-px bg-gradient-to-b from-[#f59e0b]/50 via-zinc-700 to-zinc-800" />
              {milestones.map((m, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="group relative flex gap-8 pb-14 last:pb-0">
                    <div className="absolute -left-[13px] top-4 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-zinc-700 bg-zinc-900 text-[10px] font-bold text-zinc-500 shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-125 group-hover:border-[#f59e0b] group-hover:text-[#f59e0b] group-hover:shadow-lg group-hover:shadow-[#f59e0b]/20">
                      {m.year.slice(2)}
                    </div>
                    <div className="ml-12 pt-1 transition-all duration-300 group-hover:translate-x-1.5">
                      <span className="mb-1 block text-xs font-medium tracking-wider uppercase transition-colors duration-300 text-zinc-600 group-hover:text-[#f59e0b]">
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

        <section className="relative overflow-hidden py-24"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${sectionColors.social.bg}, transparent 70%)` }}>
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-50" />
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: hoveredSocial ? `radial-gradient(ellipse 60% 50% at 50% 50%, ${hoveredSocial}15 0%, transparent 60%)` : "none",
                opacity: hoveredSocial ? 1 : 0,
              }}
            />
          </div>
          <div className="relative mx-auto max-w-4xl px-6 text-center">
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
                    onMouseEnter={() => setHoveredSocial(s.color)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    className={`inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-400 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.border} ${s.text} ${s.shadow}`}
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
