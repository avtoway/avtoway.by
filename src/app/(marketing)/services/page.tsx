import { container } from "@/di/container";
import type { ServiceRepository } from "@/entities/service/service.repository";
import Link from "next/link";

export const revalidate = 300;

export default async function ServicesPage() {
  const repo = container.get<ServiceRepository>("ServiceRepository");
  const services = await repo.getActive();

  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-white">Наши услуги</h1>
          <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto">
            Полный спектр услуг для вашего автомобиля. От аренды до полного выкупа.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(s => (
            <Link key={s.slug} href={s.href}
              className="group relative block rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:-translate-y-1">
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-2xl transition-all duration-500 group-hover:shadow-lg"
                style={{ backgroundColor: s.color, boxShadow: `0 0 20px ${s.color}40` }}
              />
              <h3 className="mt-1 text-xl font-bold text-white transition-colors duration-300"
                style={{ color: s.color }}>
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                {s.desc}
              </p>
              <div className="mt-6 flex items-center gap-1 text-sm font-medium transition-colors duration-300"
                style={{ color: s.color }}>
                Подробнее
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        {services.length === 0 && (
          <p className="pt-20 text-center text-zinc-600">Скоро здесь появятся услуги</p>
        )}
      </div>
    </div>
  );
}
