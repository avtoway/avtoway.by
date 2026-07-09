import { SOCIAL_LINKS } from "@/shared/config/social";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950/80">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 text-3xl font-extrabold tracking-wider text-zinc-500">
              АВТО<span className="text-primary/60">WAY</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
              Личный бренд и проекты про автомобили. Честные обзоры,
              ремонты, лайфхаки и полезные услуги.
            </p>
          </div>

          <div className="shrink-0">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Мы в сети
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-4 text-xs font-medium text-zinc-500 shadow-inner shadow-black/10 transition-all hover:-translate-y-0.5 hover:border-zinc-600 hover:text-zinc-300"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/30 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-zinc-700">
          © {new Date().getFullYear()} АВТОWAY. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
