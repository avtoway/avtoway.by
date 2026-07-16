"use client";

import Reveal from "@/shared/ui/reveal";
import AnimatedSection from "@/shared/ui/animated-section";
import AnimatedCounter from "@/shared/ui/animated-counter";

const paragraphs = [
  "Меня зовут Витя. С детства бредил автомобилями — знал все марки и модели, хотя учился совсем в другой сфере. Первая машина — Dacia Logan 1.4 2007 года, купленная по низу рынка в 2020-м. Привёл в порядок и начал по вечерам работать в такси.",
  "Параллельно учился: в 2021-м прошёл курсы по автоэлектрике и диагностике. Начал помогать друзьям с подбором машин — появились первые клиенты. Через год — Москва, ещё один опыт. Вернулся — снова работа, такси, подбор. Всё сразу.",
  "В октябре 2023 года создал YouTube-канал. Начал снимать про такси, про жизнь. Поставил себе челлендж: заработать 10.000 белорусских рублей. Получилось. На эти деньги купил оборудование для ремонта авто. А 1 августа 2024-го нашёл гараж и начал обустраивать свою мастерскую.",
  "Первым пациентом стал Hyundai Accent 1998 года — цена как у айфона. Делал, снимал, боялся ошибиться. Потом нашёл Seat Cordoba 2002 года — редкое купе на 1.9 TDI. За два года до покупки я шутил друзьям, что когда-нибудь он будет моим. Мысли материальны.",
  "Accent продал подписчику с YouTube. Seat привёл в порядок. А Logan зажил новой жизнью: я начал переваривать арки, двери, и это переросло в проект, которого в СНГ ещё не видели. Сейчас я делаю его по вечерам после работы — и он станет самым быстрым и красивым Logan, какой вы видели.",
];

const icons = ["🚗", "🔧", "🎥", "💪", "🏆"];

export default function AboutStory() {
  return (
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
          {paragraphs.map((text, i) => (
            <Reveal key={i} delay={100 + i * 100}>
              <div className="group flex gap-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800/80 text-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-700/80">
                  {icons[i]}
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
  );
}
