import Reveal from "@/shared/ui/reveal";

export default function AboutHero() {
  return (
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
          <div className="shrink-0 animate-float" style={{ animationDuration: "5s" }}>
            <div className="relative h-36 w-36 overflow-hidden rounded-2xl border border-zinc-700 shadow-lg shadow-black/20 transition-shadow duration-300 hover:border-[#ef4444]/50 hover:shadow-lg hover:shadow-[#ef4444]/10 sm:h-44 sm:w-44">
              <picture>
                <source srcSet="/images/avatar.webp" type="image/webp" />
                <img src="/images/avatar.jpg" alt="АВТОWAY" className="h-full w-full object-cover" />
              </picture>
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 pointer-events-none" />
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
  );
}
