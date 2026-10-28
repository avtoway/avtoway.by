import { notFound } from "next/navigation";
import Image from "next/image";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Metadata } from "next";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { ServiceSchema } from "@/shared/ui/json-ld";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getService(slug: string) {
  const repo = container.get<ServiceRepository>("ServiceRepository");
  return repo.getBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return { title: "Услуга не найдена", robots: { index: false, follow: false } };
  const title = `${service.title} — АВТОWAY`;
  return {
    title: { absolute: title },
    description: service.desc,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title,
      description: service.desc,
      url: `/services/${slug}`,
      type: "website",
      images: [{ url: service.photo || "/opengraph-image.jpg", alt: service.title }],
    },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service || !service.isActive) notFound();

  return (
    <div className="min-h-screen bg-zinc-950">
      <ServiceSchema name={service.title} description={service.desc} url={`/services/${slug}`} />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: service.title },
        ]}
      />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-2">
        <PageBreadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Услуги", href: "/services" },
            { label: service.title },
          ]}
        />
      </div>
      <section className="relative flex min-h-[60dvh] items-center overflow-hidden">
        {service.photo && (
          <div className="absolute inset-0">
            <Image
              src={service.photo}
              alt={service.title}
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/40" />
          </div>
        )}
        <div className="relative mx-auto w-full max-w-4xl px-6 pt-24 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
              style={{ color: service.photo ? "#fff" : service.color }}>
              {service.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed sm:text-xl"
              style={{ color: service.photo ? "rgba(255,255,255,0.8)" : "#a1a1aa" }}>
              {service.desc}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      {service.content && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="prose prose-invert prose-zinc max-w-none">
            {service.content.split("\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-zinc-300 mb-4">{p}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
