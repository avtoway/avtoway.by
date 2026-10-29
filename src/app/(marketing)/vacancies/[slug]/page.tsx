import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import type { VacancyRepository } from "@/entities/vacancy/vacancy.repository";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { JobPostingSchema } from "@/shared/ui/json-ld";
import LandingIcon from "@/features/service-landings/ui/icon";
import VacancyApplyForm from "@/features/vacancies/ui/vacancy-apply-form";
import {
  employmentLabel,
  formatPublished,
  formatSalary,
  parseLines,
  workFormatLabel,
} from "@/features/vacancies/lib/vacancy-format";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getVacancy(slug: string) {
  const repo = container.get<VacancyRepository>("VacancyRepository");
  return repo.getBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getVacancy(slug);
  if (!vacancy || !vacancy.isActive || new Date(vacancy.publishedAt) > new Date()) {
    return { title: "Вакансия не найдена", robots: { index: false, follow: false } };
  }

  return {
    title: { absolute: `${vacancy.title} — вакансия АВТОWAY` },
    description: vacancy.shortDescription,
    alternates: { canonical: `/vacancies/${vacancy.slug}` },
    openGraph: {
      title: `${vacancy.title} | АВТОWAY`,
      description: vacancy.shortDescription,
      url: `/vacancies/${vacancy.slug}`,
      type: "website",
    },
  };
}

function ListSection({
  badge,
  title,
  items,
  accent = "red",
}: {
  badge: string;
  title: string;
  items: string[];
  accent?: "red" | "blue" | "emerald" | "amber";
}) {
  if (items.length === 0) return null;

  const tones = {
    red: { badge: "border-red-500/20 bg-red-500/10 text-red-300", dot: "bg-red-400" },
    blue: { badge: "border-blue-500/20 bg-blue-500/10 text-blue-300", dot: "bg-blue-400" },
    emerald: { badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
    amber: { badge: "border-amber-500/20 bg-amber-500/10 text-amber-300", dot: "bg-amber-400" },
  }[accent];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-7">
      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones.badge}`}>
        {badge}
      </span>
      <h2 className="mt-3 text-xl font-bold text-white">{title}</h2>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tones.dot}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function VacancyPage({ params }: Props) {
  const { slug } = await params;
  const vacancy = await getVacancy(slug);

  if (!vacancy || !vacancy.isActive || new Date(vacancy.publishedAt) > new Date()) {
    notFound();
  }

  const contact = await getPrismaClient().contact.findFirst();
  const phone = vacancy.contactPhone || contact?.phone || null;
  const email = vacancy.contactEmail || contact?.email || null;
  const telegram = vacancy.contactTelegram || contact?.telegram || null;
  const format = workFormatLabel(vacancy.workFormat);
  const responsibilities = parseLines(vacancy.responsibilities);
  const requirements = parseLines(vacancy.requirements);
  const conditions = parseLines(vacancy.conditions);
  const benefits = parseLines(vacancy.benefits);

  const jobDescription = [
    vacancy.shortDescription,
    vacancy.description,
    responsibilities.length ? `Задачи: ${responsibilities.join("; ")}` : "",
    requirements.length ? `Требования: ${requirements.join("; ")}` : "",
    conditions.length ? `Условия: ${conditions.join("; ")}` : "",
    benefits.length ? `Бонусы: ${benefits.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 pt-28">
      <JobPostingSchema
        title={vacancy.title}
        description={jobDescription}
        datePosted={vacancy.publishedAt}
        employmentType={vacancy.employmentType}
        location={vacancy.location}
        salaryFrom={vacancy.salaryFrom}
        salaryTo={vacancy.salaryTo}
        salaryCurrency={vacancy.salaryCurrency}
        salaryPeriod={vacancy.salaryPeriod}
        url={`/vacancies/${vacancy.slug}`}
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Вакансии", href: "/vacancies" },
          { label: vacancy.title },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6">
        <PageBreadcrumbs
          className="mb-8"
          items={[
            { label: "Главная", href: "/" },
            { label: "Вакансии", href: "/vacancies" },
            { label: vacancy.title },
          ]}
        />

        <header className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/10 blur-[100px]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-300">
                {vacancy.department || "АВТОWAY"}
              </span>
              {vacancy.isFeatured && (
                <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                  Срочная вакансия
                </span>
              )}
              <span className="text-xs text-zinc-600">Опубликовано {formatPublished(vacancy.publishedAt)}</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {vacancy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {vacancy.shortDescription}
            </p>

            <div className="mt-7 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                <LandingIcon name="map-pin" className="h-4 w-4 text-zinc-600" />
                {vacancy.location}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                <LandingIcon name="clock" className="h-4 w-4 text-zinc-600" />
                {employmentLabel(vacancy.employmentType)}
              </span>
              {format && (
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                  <LandingIcon name="users" className="h-4 w-4 text-zinc-600" />
                  {format}
                </span>
              )}
              {vacancy.experience && (
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                  <LandingIcon name="check" className="h-4 w-4 text-zinc-600" />
                  {vacancy.experience}
                </span>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-zinc-800/80 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-600">Оплата</p>
                <p className="mt-1 text-2xl font-bold text-amber-300">{formatSalary(vacancy)}</p>
                {vacancy.schedule && <p className="mt-1 text-xs text-zinc-500">{vacancy.schedule}</p>}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <a
                  href="#apply"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Откликнуться
                  <LandingIcon name="arrow-right" className="h-4 w-4" />
                </a>
                {phone && (
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/60 px-6 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    {phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-5">
            {vacancy.description && (
              <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">О вакансии</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                  {vacancy.description}
                </p>
              </section>
            )}

            <ListSection
              badge="Задачи"
              title="Чем предстоит заниматься"
              items={responsibilities}
              accent="red"
            />
            <ListSection
              badge="Требования"
              title="Что мы ждём"
              items={requirements}
              accent="blue"
            />
            <ListSection
              badge="Условия"
              title="Что предлагаем"
              items={conditions}
              accent="emerald"
            />
            <ListSection
              badge="Бонусы"
              title="Дополнительно"
              items={benefits}
              accent="amber"
            />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Коротко</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                  <span className="text-zinc-500">Город</span>
                  <span className="text-right text-zinc-300">{vacancy.location}</span>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                  <span className="text-zinc-500">Занятость</span>
                  <span className="text-right text-zinc-300">{employmentLabel(vacancy.employmentType)}</span>
                </div>
                {format && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">Формат</span>
                    <span className="text-right text-zinc-300">{format}</span>
                  </div>
                )}
                {vacancy.schedule && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">График</span>
                    <span className="text-right text-zinc-300">{vacancy.schedule}</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <span className="text-zinc-500">Оплата</span>
                  <span className="text-right font-medium text-amber-300">{formatSalary(vacancy)}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-800/70 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Контакт</p>
                {vacancy.contactName && <p className="mt-2 text-sm text-zinc-300">{vacancy.contactName}</p>}
                <div className="mt-2 space-y-1.5 text-sm">
                  {phone && <p className="text-zinc-400">{phone}</p>}
                  {email && <p className="break-all text-zinc-400">{email}</p>}
                  {telegram && (
                    <a href={telegram} target="_blank" rel="noopener noreferrer" className="block break-all text-red-300 hover:text-red-200">
                      Telegram
                    </a>
                  )}
                </div>
              </div>

              <a
                href="#apply"
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Откликнуться
                <LandingIcon name="arrow-right" className="h-4 w-4" />
              </a>
              <Link href="/vacancies" className="mt-3 block text-center text-xs text-zinc-500 transition hover:text-white">
                ← Все вакансии
              </Link>
            </div>
          </aside>
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <VacancyApplyForm vacancyTitle={vacancy.title} contactPhone={phone} />
        </div>
      </div>
    </div>
  );
}
