import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { AutoPodborCase } from "@/entities/autopodbor/autopodbor.types";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { casePhotos } from "@/features/autopodbor/lib/case-photos";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Наши работы — кейсы автоподбора",
  description: "Реальные кейсы АВТОWAY: что искали, что нашли, сколько сторговали и какие были вложения.",
  alternates: { canonical: "/works" },
  openGraph: {
    title: "Наши работы — кейсы АВТОWAY",
    description: "Реальные кейсы автоподбора: бюджет, находка, торг и вложения.",
    url: "/works",
    type: "website",
  },
};

function previewPhoto(item: AutoPodborCase): string | undefined {
  return casePhotos(item)[0];
}

interface Props {
  searchParams: Promise<{ brand?: string }>;
}

export default async function WorksPage({ searchParams }: Props) {
  const { brand } = await searchParams;
  let cases: AutoPodborCase[] = [];
  try {
    cases = await container.get<AutoPodborRepository>("AutoPodborRepository").getCases(true);
  } catch {
    cases = [];
  }

  const brands = [...new Set(cases.map(item => item.brand).filter(Boolean) as string[])].sort();
  const filtered = brand
    ? cases.filter(item => (item.brand ?? "").toLowerCase() === brand.toLowerCase())
    : cases;

  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Наши работы" }]} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Наши работы" }]} />

        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Наши работы</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Реальные кейсы: какой был бюджет, что нашли, сколько сторговали и какие вложения предстоят.
            Без выдуманных историй — только автомобили, которые мы действительно проверяли и подбирали.
          </p>
        </header>

        {brands.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href="/works"
              className={`rounded-full border px-3 py-1.5 text-xs transition ${!brand ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}
            >
              Все марки
            </Link>
            {brands.map(item => (
              <Link
                key={item}
                href={`/works?brand=${encodeURIComponent(item)}`}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${brand?.toLowerCase() === item.toLowerCase() ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}`}
              >
                {item}
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-400">Кейсы появятся здесь после первых завершённых подборов.</p>
            <p className="mt-2 text-xs text-zinc-600">
              Хотите стать первым? <Link href="/services/inspection" className="text-red-300 underline">Заказать автоподбор</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const photo = previewPhoto(item);
              return (
                <Link
                  key={item.id}
                  href={`/works/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-red-500/40"
                >
                  <div className="relative aspect-[4/3] bg-zinc-900">
                    {photo ? (
                      <Image src={photo} alt={item.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-600">Фото скоро появится</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {[item.brand, item.model, item.year].filter(Boolean).join(" · ")}
                    </p>
                    {item.result && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{item.result}</p>}
                    <span className="mt-3 inline-flex text-xs font-medium text-red-300 transition group-hover:text-red-200">
                      Смотреть кейс →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
