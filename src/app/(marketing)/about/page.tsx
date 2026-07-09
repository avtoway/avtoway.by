"use client";

import { useState, useRef } from "react";
import Reveal from "@/components/reveal";
import AnimatedSection from "@/components/animated-section";
import AnimatedCounter from "@/components/animated-counter";
import { SOCIAL_LINKS } from "@/shared/config/social";
import { MILESTONES } from "@/shared/config/milestones";
import { IconInstagram, IconRutube, IconVK, IconYouTube } from "@/shared/ui/icons";
import { useInView } from "@/shared/lib/hooks/use-in-view";

const sectionColors = {
  hero: "rgba(239,68,68,0.12)",
  story: "rgba(59,130,246,0.10)",
  timeline: "rgba(245,158,11,0.10)",
  social: "rgba(16,185,129,0.10)",
};

const storyIcons = ["🚗", "🔧", "🎥", "💪", "🏆"];

function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "youtube":
      return <IconYouTube className={className} />;
    case "instagram":
      return <IconInstagram className={className} />;
    case "rutube":
      return <IconRutube className={className} />;
    case "vk":
      return <IconVK className={className} />;
    default:
      return null;
  }
}

export default function AboutPage() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { threshold: 0.1 });

  return (
    <>
      {/* SECTION 1: Hero */}
      <section
        className="relative overflow-hidden pt-32 pb-24"
        style={{
          background: "linear-gradient(-45deg, rgba(239,68,68,0.06), rgba(59,130,246,0.04), rgba(239,68,68,0.06))",
          backgroundSize: "400% 400%",
        }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-10 top-10 h-16 w-16 rounded-xl border border-primary/20 bg-primary/5"
            style={{ animation: "float-shape 15s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-10 right-1/4 h-12 w-12 rounded-full border border-accent2/20 bg-accent2/5"
            style={{ animation: "float-shape 13s ease-in-out -5s infinite" }}
          />
          <div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            style={{ animation: "beam-sweep 6s ease-in-out infinite" }}
          />
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.25), transparent 70%)", animation: "gradient-shift 8s ease-in-out infinite" }} />
          <div className="absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)", animation: "gradient-shift 11s ease-in-out -4s infinite reverse" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-start gap-10 sm:flex-row sm:items-center">
            <div className="group shrink-0 animate-float" style={{ animationDuration: "5s" }}>
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

      {/* SECTION 2: Story */}
      <AnimatedSection
        color="#3b82f6" topOffset={0}
        className="py-24"
        style={{
          background: "linear-gradient(-45deg, rgba(59,130,246,0.05), rgba(16,185,129,0.03), rgba(59,130,246,0.05))",
          backgroundSize: "400% 400%",
        }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/4 -top-8 h-14 w-14 rounded-full border border-accent2/20 bg-accent2/5"
            style={{ animation: "float-shape 16s ease-in-out infinite" }}
          />
          <div
            className="absolute -right-6 bottom-1/3 h-10 w-10 rotate-45 border border-green/20 bg-green/5"
            style={{ animation: "float-shape 14s ease-in-out -6s infinite" }}
          />
          <div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent2/5 to-transparent"
            style={{ animation: "beam-sweep 5s ease-in-out infinite" }}
          />
          <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full blur-[100px]" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)", animation: "gradient-shift 10s ease-in-out infinite" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="mb-8 text-3xl font-bold text-white group">
              Кто я и почему вам можно верить
            </h2>
          </Reveal>

          <div className="mb-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <AnimatedCounter value={5} label="лет в деле" suffix="+" delay={200} />
            <AnimatedCounter value={4} label="проекта" suffix="" delay={400} />
            <AnimatedCounter value={1} label="мастерская" suffix="" delay={600} />
            <AnimatedCounter value={2} label="года на YouTube" suffix="" delay={800} />
          </div>

          <div className="space-y-8 text-zinc-400 leading-relaxed">
            {[
              "Меня зовут Витя. С детства бредил автомобилями — знал все марки и модели, хотя учился совсем в другой сфере. Первая машина — Dacia Logan 1.4 2007 года, купленная по низу рынка в 2020-м. Привёл в порядок и начал по вечерам работать в такси.",
              "Параллельно учился: в 2021-м прошёл курсы по автоэлектрике и диагностике. Начал помогать друзьям с подбором машин — появились первые клиенты. Через год — Москва, ещё один опыт. Вернулся — снова работа, такси, подбор. Всё сразу.",
              "В октябре 2023 года создал YouTube-канал. Начал снимать про такси, про жизнь. Поставил себе челлендж: заработать 10.000 белорусских рублей. Получилось. На эти деньги купил оборудование для ремонта авто. А 1 августа 2024-го нашёл гараж и начал обустраивать свою мастерскую.",
              "Первым пациентом стал Hyundai Accent 1998 года — цена как у айфона. Делал, снимал, боялся ошибиться. Потом нашёл Seat Cordoba 2002 года — редкое купе на 1.9 TDI. За два года до покупки я шутил друзьям, что когда-нибудь он будет моим. Мысли материальны.",
              "Accent продал подписчику с YouTube. Seat привёл в порядок. А Logan зажил новой жизнью: я начал переваривать арки, двери, и это переросло в проект, которого в СНГ ещё не видели. Сейчас я делаю его по вечерам после работы — и он станет самым быстрым и красивым Logan, какой вы видели.",
            ].map((text, i) => (
              <Reveal key={i} delay={100 + i * 100}>
                <div className="group flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800/80 text-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-700/80">
                    {storyIcons[i]}
                  </span>
                  <p className="flex-1">{text}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={600}>
              <div className="animate-glow relative rounded-xl border border-primary/20 bg-primary/5 p-6 italic text-zinc-300">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
                <p className="relative">
                  За этим проектом стоит человек, а не безликая контора.
                  Человек, который делает всё руками, не прячется и берётся
                  за то, от чего другие отворачиваются.
                  <br />
                  <span className="text-primary font-medium not-italic">
                    АВТОWAY — нам можно верить.
                  </span>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION 3: Timeline */}
      <AnimatedSection
        color="#f59e0b" topOffset={0}
        className="py-24"
        style={{
          background: "linear-gradient(-45deg, rgba(245,158,11,0.05), rgba(239,68,68,0.03), rgba(245,158,11,0.05))",
          backgroundSize: "400% 400%",
        }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute right-10 top-10 h-12 w-12 rounded-full border border-accent/20 bg-accent/5"
            style={{ animation: "float-shape 17s ease-in-out infinite" }}
          />
          <div
            className="absolute -left-6 bottom-1/4 h-14 w-14 rotate-45 border border-primary/20 bg-primary/5"
            style={{ animation: "float-shape 13s ease-in-out -7s infinite" }}
          />
          <div
            className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent/5 to-transparent"
            style={{ animation: "beam-sweep 7s ease-in-out infinite" }}
          />
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${sectionColors.timeline}, transparent 70%)`, animation: "gradient-shift 12s ease-in-out infinite" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6">
          <Reveal>
            <h2 className="mb-16 text-3xl font-bold text-white">История</h2>
          </Reveal>
          <div ref={timelineRef} className="relative">
            <div
              className="absolute left-[19px] top-3 w-px bg-gradient-to-b from-[#f59e0b]/50 via-zinc-700 via-60% to-transparent"
              style={{
                height: "calc(100% + 48px)",
                clipPath: timelineInView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
                transition: "clip-path 1.2s ease-out",
              }}
            />
            {MILESTONES.map((m, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="group relative flex gap-8 pb-14 last:pb-0">
                  <div
                    className={`absolute -left-[13px] top-4 z-10 flex items-center justify-center rounded-full border-2 bg-zinc-900 text-[10px] font-bold shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-125 group-hover:border-[#f59e0b] group-hover:text-[#f59e0b] group-hover:shadow-lg group-hover:shadow-[#f59e0b]/20 ${
                      i === MILESTONES.length - 1
                        ? "h-[30px] w-[30px] border-[#f59e0b] text-[#f59e0b] shadow-[#f59e0b]/30 animate-pulse"
                        : "h-[26px] w-[26px] border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {m.year.slice(2)}
                  </div>
                  <div className="ml-12 pt-1 transition-all duration-300 group-hover:translate-x-1.5">
                    <span className="mb-1 block text-xs font-medium tracking-wider uppercase transition-colors duration-300 text-zinc-600 group-hover:text-[#f59e0b]">
                      {m.year}{i === MILESTONES.length - 1 ? " — сейчас" : ""}
                    </span>
                    <h3 className="mb-2 text-base font-semibold transition-colors duration-300 text-zinc-300 group-hover:text-white">
                      {m.title}
                    </h3>
                    <p className="text-sm leading-relaxed transition-colors duration-300 text-zinc-500 group-hover:text-zinc-300">
                      {m.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}

            <div className="relative h-14">
              <div className="absolute -left-[13px] flex h-[26px] w-[26px] items-center justify-center">
                <span className="absolute h-4 w-4 animate-ping rounded-full bg-[#f59e0b]/40" />
                <span className="absolute h-6 w-6 animate-ping rounded-full bg-[#f59e0b]/20" style={{ animationDelay: "0.5s" }} />
                <span className="absolute h-8 w-8 animate-ping rounded-full bg-[#f59e0b]/10" style={{ animationDelay: "1s" }} />
                <span className="absolute h-3 w-3 animate-pulse rounded-full bg-[#f59e0b]" />
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* SECTION DIVIDER */}
      <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

      {/* SECTION 4: Social */}
      <AnimatedSection
        color="#10b981" topOffset={0}
        className="py-24"
        style={{
          background: "linear-gradient(-45deg, rgba(16,185,129,0.05), rgba(59,130,246,0.03), rgba(16,185,129,0.05))",
          backgroundSize: "400% 400%",
        }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/3 -top-6 h-10 w-10 rounded-xl border border-green/20 bg-green/5"
            style={{ animation: "float-shape 14s ease-in-out infinite" }}
          />
          <div
            className="absolute -right-8 bottom-10 h-16 w-16 rounded-full border border-accent2/20 bg-accent2/5"
            style={{ animation: "float-shape 18s ease-in-out -3s infinite" }}
          />
          <div
            className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-green/5 to-transparent"
            style={{ animation: "beam-sweep 5.5s ease-in-out infinite" }}
          />
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${sectionColors.social}, transparent 70%)`, animation: "gradient-shift 9s ease-in-out infinite" }} />
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
            {SOCIAL_LINKS.map((s, i) => (
              <Reveal key={s.label} delay={200 + i * 80}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHoveredSocial(s.color)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-400 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.border} ${s.text} ${s.shadow}`}
                >
                  <SocialIcon icon={s.icon} className="size-4" />
                  {s.label}
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA */}
      <section
        className="relative overflow-hidden border-t py-24 text-center"
        style={{
          borderColor: "rgba(239,68,68,0.2)",
          animation: "breathe-border 4s ease-in-out infinite",
          background: "linear-gradient(-45deg, rgba(239,68,68,0.04), rgba(59,130,246,0.04), rgba(16,185,129,0.04), rgba(239,68,68,0.04))",
          backgroundSize: "400% 400%",
        }}
      >
        {/* Floating geometric shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-10 top-10 h-20 w-20 rounded-xl border border-primary/20 bg-primary/5"
            style={{ animation: "float-shape 14s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-10 right-16 h-14 w-14 rounded-full border border-accent2/20 bg-accent2/5"
            style={{ animation: "float-shape 18s ease-in-out -4s infinite" }}
          />
          <div
            className="absolute left-1/3 top-1/3 h-10 w-10 rotate-45 border border-accent/20 bg-accent/5"
            style={{ animation: "float-shape 12s ease-in-out -8s infinite" }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-16 w-16 rounded-full border border-green/20 bg-green/5"
            style={{ animation: "float-shape 16s ease-in-out -2s infinite" }}
          />
          {/* Sweeping beam */}
          <div
            className="absolute inset-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            style={{ animation: "beam-sweep 4s ease-in-out infinite" }}
          />
          {/* Gradient blobs */}
          <div
            className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, rgba(239,68,68,0.3), transparent 70%)", animation: "gradient-shift 7s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-20 -right-20 h-[350px] w-[350px] rounded-full blur-[90px]"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2), transparent 70%)", animation: "gradient-shift 9s ease-in-out -3s infinite reverse" }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
            style={{ background: "radial-gradient(circle, rgba(239,68,68,0.2), transparent 70%)", animation: "pulse 2.5s ease-in-out infinite" }}
          />
        </div>

        <div className="relative mx-auto max-w-2xl px-6">
          <Reveal>
            <h2 className="mb-4 text-3xl font-bold text-white">Готовы начать?</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mb-10 text-zinc-400">
              Посмотрите, чем я могу быть полезен, или просто подпишитесь,
              чтобы следить за проектами.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <a
                href="/#services"
                className="group relative inline-flex h-12 items-center overflow-hidden rounded-full bg-primary px-8 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/40"
              >
                <span className="absolute inset-0 -translate-x-full rounded-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
                <span className="relative">Наши услуги</span>
              </a>
              <a
                href="https://youtube.com/@avtoway"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center rounded-full border border-zinc-700 bg-zinc-900/80 px-8 text-sm font-medium text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white hover:shadow-xl"
              >
                YouTube канал
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
