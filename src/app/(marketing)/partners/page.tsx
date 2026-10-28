import type { Metadata } from "next";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";

export const metadata: Metadata = {
  title: "Партнёры",
  description: "Наши партнёры и компании, с которыми мы сотрудничаем.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return (
    <section className="min-h-dvh bg-zinc-950 px-6 pb-24 pt-28">
      <div className="mx-auto max-w-2xl">
        <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Партнёры" }]} />
        <PageBreadcrumbs
          className="mb-16"
          items={[
            { label: "Главная", href: "/" },
            { label: "Партнёры" },
          ]}
        />
        <div className="text-center">
          <h1 className="mb-6 text-4xl font-bold text-white">Партнёры</h1>
          <p className="text-zinc-400">Скоро здесь появится список партнёров.</p>
        </div>
      </div>
    </section>
  );
}
