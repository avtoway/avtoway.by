import Reveal from "@/shared/ui/reveal";
import { IconArrowRight } from "@/shared/ui/icons";

export default function AboutSection() {
  return (
    <section id="about" className="border-t border-zinc-800/50 py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="mb-6 text-3xl font-bold text-white">О проекте</h2>
        </Reveal>
        <Reveal delay={150}>
          <p className="text-lg leading-relaxed text-zinc-400">
            АВТОWAY — личный бренд и проекты про автомобили, где я показываю всё как есть.
            Честные обзоры, ремонты, лайфхаки и полезные услуги. Я делаю то, что не делают другие.
            Я делаю то, что нужно Вам.
          </p>
        </Reveal>
        <Reveal delay={300}>
          <div className="mt-8">
            <a
              href="/about"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-6 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500 hover:text-white active:scale-95"
            >
              Подробнее о проекте
              <IconArrowRight />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
