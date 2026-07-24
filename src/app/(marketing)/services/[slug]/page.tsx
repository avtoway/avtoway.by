import { notFound, redirect } from "next/navigation";
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
      <section className="flex min-h-[70dvh] items-center justify-center px-6 pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold text-white sm:text-6xl"
            style={{ color: service.color }}>
            {service.title}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400 sm:text-xl">
            {service.desc}
          </p>
        </div>
      </section>
    </div>
  );
}
