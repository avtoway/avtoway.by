import Link from "next/link";
import { IconArrowRight, IconCheckCircle } from "@/shared/ui/icons";

interface ServicesEmptyStateProps {
  phone?: string | null;
  youtubeUrl?: string | null;
}

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.45 5.7 3.8 9.05 9.5 9.5-5.7.45-9.05 3.8-9.5 9.5-.45-5.7-3.8-9.05-9.5-9.5 5.7-.45 9.05-3.8 9.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function Wrench({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <path d="M14.7 6.3a4.4 4.4 0 0 0-5.6 5.6L4 17l3 3 5.1-5.1a4.4 4.4 0 0 0 5.6-5.6l-2.5 2.5-2.9-.8-.8-2.9 2.2-1.8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Route({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M8.2 18h3.3a3 3 0 0 0 0-6H11a3 3 0 0 1 0-6h4.8" strokeLinecap="round" />
    </svg>
  );
}

function Key({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <circle cx="8" cy="15" r="3.5" />
      <path d="m10.6 12.4 7.9-7.9M15.5 7.5l2 2M17.5 5.5l2 2" strokeLinecap="round" />
    </svg>
  );
}

function CarGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M8 28h48M13 28c0-6.2 2.1-10.7 6.4-13.7l4.3-3c1.3-.9 2.8-1.3 4.3-1.3h7.9c1.5 0 3 .4 4.3 1.3l4.3 3C48.9 17.3 51 21.8 51 28" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.5 15.5h23M24 33h16" strokeLinecap="round" />
      <circle cx="20" cy="28" r="4.2" />
      <circle cx="44" cy="28" r="4.2" />
    </svg>
  );
}

export default function ServicesEmptyState({ phone, youtubeUrl }: ServicesEmptyStateProps) {
  const callHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "/contacts";

  return (
    <section className="relative overflow-hidden pb-24 pt-10 sm:pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-red-500/5 blur-[90px]" />
        <div className="absolute -right-24 top-1/2 h-72 w-72 rounded-full bg-orange-500/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Витрина обновляется
          </span>

          <div className="relative mx-auto mt-10 h-44 w-44 sm:h-52 sm:w-52">
            <div className="absolute inset-0 rounded-full border border-zinc-800/80" />
            <div className="absolute inset-5 rounded-full border border-dashed border-zinc-800/70 animate-[float-shape_24s_linear_infinite]" />
            <div className="absolute inset-12 rounded-full bg-red-600/10 blur-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-red-500/25 bg-zinc-900/90 text-primary shadow-[0_0_45px_rgba(239,68,68,0.18)] backdrop-blur-sm sm:h-24 sm:w-24">
                <CarGlyph className="h-9 w-11 sm:h-10 sm:w-12" />
              </div>
            </div>

            <span className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-500 shadow-lg shadow-black/30 animate-float">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-500 shadow-lg shadow-black/30 animate-float [animation-delay:600ms]">
              <Key className="h-4 w-4" />
            </span>
            <span className="absolute bottom-0 left-1/2 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-500 shadow-lg shadow-black/30 animate-float [animation-delay:1200ms]">
              <Route className="h-4 w-4" />
            </span>
            <span className="absolute left-0 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-500 shadow-lg shadow-black/30 animate-float [animation-delay:1800ms]">
              <Spark className="h-4 w-4 text-primary/70" />
            </span>
          </div>

          <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Витрина услуг <span className="text-primary">на паузе</span>.
            <br className="hidden sm:block" /> Маршрут — нет.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
            Мы пересобираем список направлений и готовим новые услуги. Пока витрина обновляется,
            вы можете написать нам напрямую — подскажем, чем помочь с автомобилем уже сейчас.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contacts"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20"
            >
              Написать нам
              <IconArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/50 px-6 text-sm font-medium text-zinc-300 transition-all hover:-translate-y-0.5 hover:border-zinc-700 hover:text-white"
            >
              На главную
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          <InfoCard
            eyebrow="01"
            title="Расскажите задачу"
            text="Опишите, что нужно сделать с авто — предложим решение и сориентируем по стоимости."
            href="/contacts"
            icon={<CarGlyph className="h-5 w-7" />}
          />
          <InfoCard
            eyebrow="02"
            title={phone ? "Позвоните" : "Будьте на связи"}
            text={phone ?? "Оставьте заявку, и мы свяжемся с вами в удобном мессенджере."}
            href={callHref}
            icon={<IconCheckCircle className="h-5 w-5" />}
          />
          <InfoCard
            eyebrow="03"
            title="Посмотрите видео"
            text="Ремонт, обзоры и практика — на нашем YouTube-канале."
            href={youtubeUrl || "https://youtube.com/@avtoway"}
            external
            icon={<PlayIcon />}
          />
        </div>

        <p className="mx-auto mt-12 max-w-xl text-center text-xs leading-relaxed text-zinc-600">
          Список услуг формируется индивидуально. Если нужного направления нет в витрине —
          это не значит, что мы не поможем: просто спросите.
        </p>
      </div>
    </section>
  );
}

function InfoCard({
  eyebrow,
  title,
  text,
  href,
  icon,
  external = false,
}: {
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70";

  const content = (
    <>
      <div className="mb-5 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-colors group-hover:bg-red-500/15">
          {icon}
        </span>
        <span className="font-mono text-[11px] text-zinc-700">{eyebrow}</span>
      </div>
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{text}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors group-hover:text-primary">
        Перейти
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.8 5 3.2-5 3.2V8.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
