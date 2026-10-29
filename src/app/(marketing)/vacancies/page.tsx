import type { Metadata } from "next";
import Link from "next/link";
import { container } from "@/di/container";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import EmptyState from "@/shared/ui/empty-state";
import { IconCheckCircle } from "@/shared/ui/icons";
import VacancyCard from "@/features/vacancies/ui/vacancy-card";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Вакансии",
  description:
    "Открытые вакансии АВТОWAY: работа в автомобильной сфере в Минске. Условия, зарплата, задачи и контакты для отклика.",
  alternates: { canonical: "/vacancies" },
  openGraph: {
    title: "Вакансии | АВТОWAY",
    description: "Работа в автомобильной сфере: открытые вакансии и условия в АВТОWAY.",
    url: "/vacancies",
    type: "website",
  },
};

function BriefcaseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className={className} aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0110.5 4h3A1.5 1.5 0 0115 5.5V7M3 12h18M10 12v2h4v-2" strokeLinecap="round" />
    </svg>
  );
}

export default async function VacanciesPage() {
  const repo = container.get<VacancyRepository>("VacancyRepository");
  const vacancies = await repo.getActive();

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 pt-28">
      <div className="mx-auto max-w-6xl px-6">
        <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Вакансии" }]} />
        <PageBreadcrumbs
          className="mb-12"
          items={[
            { label: "Главная", href: "/" },
            { label: "Вакансии" },
          ]}
        />

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Работа в АВТОWAY
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Вакансии <span className="text-primary">АВТОWAY</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Мы ищем людей, которым интересны автомобили, сервис и честная работа. Здесь — открытые
            вакансии с понятными задачами, условиями и оплатой.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              Открытых вакансий: <strong className="text-white">{vacancies.length}</strong>
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              Минск и Беларусь
            </span>
            <span className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
              Автомобильная сфера
            </span>
          </div>
        </div>

        {vacancies.length === 0 ? (
          <EmptyState
            className="mt-12"
            accent="red"
            icon={<BriefcaseIcon className="h-8 w-8" />}
            badge="Команда АВТОWAY"
            title="Открытых вакансий пока нет"
            description="Но мы всегда рады познакомиться с сильными специалистами. Пришлите резюме — вернёмся, когда появится подходящая роль."
            actions={[
              { label: "Отправить резюме", href: "/contacts" },
              { label: "О компании", href: "/about" },
            ]}
            features={[
              {
                title: "Реальные задачи",
                text: "Автомобили, сервис и люди — без абстрактной работы.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Понятные условия",
                text: "Задачи, оплата и ожидания описаны заранее.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
              {
                title: "Своя экспертиза",
                text: "Люди, которые разбираются в автомобилях.",
                icon: <IconCheckCircle className="h-4 w-4" />,
              },
            ]}
          />
        ) : (
          <>
            <div className="mb-6 mt-12 flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-500">
                Сейчас в поиске: <strong className="text-white">{vacancies.length}</strong>
              </p>
              <Link href="/contacts" className="text-xs font-medium text-red-400 transition hover:text-red-300">
                Не нашли вакансию? Напишите нам →
              </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {vacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          </>
        )}

        <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/30 to-zinc-900/50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Резюме</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Не нашли подходящую роль?</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Пришлите резюме и коротко расскажите, что умеете. Мы свяжемся, когда появится подходящая задача.
            </p>
          </div>
          <Link
            href="/contacts"
            className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Связаться с нами
          </Link>
        </div>
      </div>
    </div>
  );
}
