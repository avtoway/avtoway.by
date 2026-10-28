import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import ServicesEmptyState from "@/features/service-page/ui/services-empty-state";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Услуги",
  description:
    "Услуги АВТОWAY: аренда авто, автоподбор и проверка перед покупкой, помощь в продаже и другие автомобильные задачи.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Услуги | АВТОWAY",
    description: "Аренда, автоподбор, продажа и другие автомобильные услуги.",
    url: "/services",
  },
};

export default async function ServicesPage() {
  const repo = container.get<ServiceRepository>("ServiceRepository");
  const services = await repo.getActive();

  if (services.length === 0) {
    const contact = await getPrismaClient().contact.findFirst();

    return (
      <div className="min-h-screen bg-zinc-950">
        <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
        <div className="mx-auto max-w-5xl px-6 pt-28">
          <PageBreadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Услуги" },
            ]}
          />
        </div>
        <ServicesEmptyState phone={contact?.phone} youtubeUrl={contact?.youtube} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24">
      <div className="mx-auto max-w-5xl px-6">
        <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Услуги" }]} />
        <PageBreadcrumbs
          className="mb-3"
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги" },
          ]}
        />
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Наши услуги</h1>
          <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto">
            Полный спектр услуг. От аренды до полного выкупа.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {services.map((s, i) => (
            <Link key={s.slug} href={s.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:-translate-y-0.5 sm:flex-row"
              style={{ animationDelay: `${i * 0.05}s` }}>

              <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-56 lg:w-72">
                <div className="absolute inset-0 bg-zinc-900" />
                {s.photo ? (
                  <Image
                    src={s.photo}
                    alt={s.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 224px, 288px"
                    loading={i === 0 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-5xl opacity-20" style={{ color: s.color }}>◈</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900/90 sm:to-zinc-900/95" />
              </div>

              <div className="flex flex-1 flex-col justify-center p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <h2 className="text-xl font-bold text-white transition-colors duration-300 sm:text-2xl">
                    {s.title}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{s.desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium transition-all duration-300"
                  style={{ color: s.color }}>
                  <span>Подробнее об услуге</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
