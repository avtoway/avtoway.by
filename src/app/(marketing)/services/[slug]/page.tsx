import { notFound } from "next/navigation";
import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import type { Metadata } from "next";

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
  if (!service) return { title: "Услуга не найдена" };
  return {
    title: `${service.title} | АВТОWAY`,
    description: service.desc,
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);

  if (!service || !service.isActive) notFound();

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero with photo background */}
      <section className="relative flex min-h-[60dvh] items-center overflow-hidden">
        {service.photo && (
          <div className="absolute inset-0">
            <img src={service.photo} alt={service.title}
              className="h-full w-full object-cover" />
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
