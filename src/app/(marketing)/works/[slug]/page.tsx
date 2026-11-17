import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { AutoPodborCase } from "@/entities/autopodbor/autopodbor.types";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { casePhotos } from "@/features/autopodbor/lib/case-photos";
import { getActiveServices } from "@/shared/lib/active-services.server";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCase(slug: string): Promise<AutoPodborCase | null> {
  try {
    const cases = await container.get<AutoPodborRepository>("AutoPodborRepository").getCases(true);
    return cases.find(item => item.slug === slug) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return { title: "Кейс не найден", robots: { index: false, follow: false } };

  const description = item.result || item.task || `${item.title} — кейс автоподбора АВТОWAY.`;
  return {
    title: `${item.title} — кейс автоподбора`,
    description,
    alternates: { canonical: `/works/${item.slug}` },
    openGraph: {
      title: `${item.title} — кейс АВТОWAY`,
      description,
      url: `/works/${item.slug}`,
      type: "article",
      images: item.mainPhoto ? [{ url: item.mainPhoto, alt: item.title }] : undefined,
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  const inspectionActive = (await getActiveServices()).some(service => service.slug === "inspection");
  const photos = casePhotos(item);
  const money = (value?: number) => (value != null ? `${value.toLocaleString("ru-RU")} BYN` : undefined);
  const facts = [
    ["Марка", item.brand],
    ["Модель", item.model],
    ["Год", item.year ? String(item.year) : undefined],
    ["Бюджет", money(item.budget)],
    ["Цена покупки", money(item.purchasePrice)],
    ["Торг", money(item.tradeAmount)],
    ["Срок", item.days ? `${item.days} дн.` : undefined],
    ["Город", item.city],
    ["Завершён", item.completedAt],
  ].filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20">
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Наши работы", href: "/works" },
          { label: item.title },
        ]}
      />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <PageBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Наши работы", href: "/works" }, { label: item.title }]} />
        <Link href="/works" className="mt-4 inline-flex text-xs text-zinc-500 transition hover:text-white">← Все работы</Link>

        <header className="mt-4 mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Кейс автоподбора</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{item.title}</h1>
        </header>

        {photos.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {photos.slice(0, 4).map((photo, index) => (
              <div
                key={photo}
                className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 ${index === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
              >
                <Image src={photo} alt={item.title} fill sizes={index === 0 ? "100vw" : "(max-width: 640px) 100vw, 50vw"} className="object-cover" priority={index === 0} />
              </div>
            ))}
          </div>
        )}

        {facts.length > 0 && (
          <section className="mt-6 grid gap-2 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
              </div>
            ))}
          </section>
        )}

        <div className="mt-6 space-y-5">
          {[
            ["Задача", item.task],
            ["Что нашли", item.found],
            ["Результат", item.result],
          ].map(([title, text]) => text ? (
            <section key={title} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">{title}</h2>
              <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-200">{text}</div>
            </section>
          ) : null)}
        </div>

        <section className="mt-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-zinc-900/50 to-zinc-950 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-white">Хотите такой же результат?</h2>
          <p className="mt-2 text-sm text-zinc-400">Подберём авто под ваш бюджет и задачу, проверим и сторгуем.</p>
          <Link
            href={inspectionActive ? "/services/inspection" : "/contacts"}
            className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white"
          >
            {inspectionActive ? "Заказать автоподбор" : "Связаться с нами"}
          </Link>
        </section>
      </div>
    </div>
  );
}
