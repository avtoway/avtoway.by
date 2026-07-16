import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Партнёры",
  description: "Наши партнёры и компании, с которыми мы сотрудничаем.",
};

export default function PartnersPage() {
  return (
    <section className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-4xl font-bold text-white">Партнёры</h1>
        <p className="text-zinc-400">Скоро здесь появится список партнёров.</p>
      </div>
    </section>
  );
}
