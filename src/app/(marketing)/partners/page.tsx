import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@/di/container";
import type { PartnerRepository } from "@/entities/partner/partner.repository";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import EmptyState from "@/shared/ui/empty-state";
import { IconCheckCircle } from "@/shared/ui/icons";
import PublicPartnerCard from "@/features/partners/ui/partner-card";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Партнёры",
  description: "Проверенные партнёры АВТОWAY: сервисы, площадки и специалисты, с которыми мы работаем.",
  alternates: { canonical: "/partners" },
  openGraph: {
    title: "Партнёры | АВТОWAY",
    description: "Круг проверенных партнёров АВТОWAY в automotive-сфере.",
    url: "/partners",
  },
};

function UsersIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c0-3.1 2.5-5.2 5.5-5.2s5.5 2.1 5.5 5.2" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.2 14.4c2.8-.3 5.3 1.5 5.3 4.6" strokeLinecap="round" />
    </svg>
  );
}

export default async function PartnersPage() {
  const repo = container.get<PartnerRepository>("PartnerRepository");
  const partners = (await repo.getAll()).filter((partner) => partner.isActive);

  return (
    <section className="min-h-dvh bg-zinc-950 px-6 pb-24 pt-28">
      <div className="mx-auto max-w-6xl">
        <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Партнёры" }]} />
        <PageBreadcrumbs
          className="mb-12"
          items={[
            { label: "Главная", href: "/" },
            { label: "Партнёры" },
          ]}
        />

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Проверенный круг
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Партнёры <span className="text-primary">АВТОWAY</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400">
            Сервисы, площадки и специалисты, с которыми мы работаем. Каждый партнёр проходит проверку
            репутации и качества — чтобы вам не приходилось искать вслепую.
          </p>
        </div>

        {partners.length === 0 ? (
          <EmptyState
            className="mt-12"
            accent="red"
            icon={<UsersIcon className="h-8 w-8" />}
            badge="Партнёрская сеть"
            title="Собираем круг проверенных партнёров"
            description="Здесь появятся сервисы, площадки и специалисты, с которыми мы готовы работать. Если вы хотите стать первым партнёром — расскажите о себе и вашем проекте."
            actions={[
              { label: "Стать партнёром", href: "/contacts" },
              { label: "О проекте", href: "/about" },
            ]}
            features={[
              {
                title: "Проверяем репутацию",
                text: "Смотрим на опыт, отзывы и качество сервиса.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Обсуждаем условия",
                text: "Формат сотрудничества — прозрачно и без сюрпризов.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Работаем вдолгую",
                text: "Нам важны партнёры, которым доверяют клиенты.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
            ]}
          />
        ) : (
          <>
            <div className="mb-5 mt-10 flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                В круге: <strong className="text-white">{partners.length}</strong>
              </p>
              <Link
                href="/contacts"
                className="text-xs font-medium text-red-400 transition hover:text-red-300"
              >
                Стать партнёром →
              </Link>
            </div>
            <div className="flex flex-col gap-5">
              {partners.map((partner) => (
                <PublicPartnerCard key={partner.id} partner={partner} />
              ))}
            </div>

            <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/30 to-zinc-900/50 p-6 sm:flex-row sm:items-center sm:p-8">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Сотрудничество</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Хотите стать партнёром АВТОWAY?</h2>
                <p className="mt-1 text-sm text-zinc-400">Расскажите о своём проекте — обсудим формат и условия.</p>
              </div>
              <Link
                href="/contacts"
                className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Обсудить сотрудничество
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
