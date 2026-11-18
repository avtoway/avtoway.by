import type { Metadata } from "next";
import Link from "next/link";
import PageBreadcrumbs from "@/shared/ui/page-breadcrumbs";
import CustomsCalculator from "@/features/calculator/ui/customs-calculator";

export const metadata: Metadata = {
  title: "Калькулятор растаможки авто в Беларуси",
  description:
    "Рассчитайте таможенную пошлину, утильсбор и сбор за оформление авто в Беларуси. Учёт возраста, объёма двигателя и льготы по Указу №140.",
  alternates: { canonical: "/calculator/customs" },
  openGraph: {
    title: "Калькулятор растаможки авто в Беларуси | АВТОWAY",
    description: "Пошлина, утильсбор и сбор за оформление — предварительный расчёт за минуту.",
    url: "/calculator/customs",
  },
};

export default function CustomsCalculatorPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-24 pt-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageBreadcrumbs
          className="mb-8"
          items={[
            { label: "Главная", href: "/" },
            { label: "Калькулятор растаможки" },
          ]}
        />

        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Калькулятор
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Растаможка авто в Беларуси
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Посчитайте пошлину, утильсбор и сбор за оформление за минуту. Расчёт предварительный —
            точную сумму подтверждает таможня.
          </p>
        </div>

        <div className="mt-10">
          <CustomsCalculator />
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm leading-relaxed text-zinc-400">
          <p className="font-semibold text-white">Как мы считаем</p>
          <ul className="mt-3 space-y-1.5 text-xs">
            <li>• Пошлина зависит от возраста авто и объёма двигателя (для электро — от стоимости).</li>
            <li>• Утильсбор и таможенный сбор взяты как ориентир для физического лица.</li>
            <li>• Льгота по Указу №140 уменьшает пошлину на 50%.</li>
            <li>• Итог не учитывает доставку, сертификацию и услуги брокера.</li>
          </ul>
        </div>

        <p className="mt-6 text-xs text-zinc-600">
          Хотите, чтобы мы проверили конкретное авто?{" "}
          <Link href="/services/inspection" className="text-zinc-400 underline transition hover:text-white">
            Заказать автоподбор
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
