import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с АВТОWAY. Контакты для сотрудничества и вопросов.",
};

export default function ContactsPage() {
  return (
    <section className="flex min-h-dvh items-center justify-center px-6 text-center">
      <div className="max-w-2xl">
        <h1 className="mb-6 text-4xl font-bold text-white">Контакты</h1>
        <p className="text-zinc-400">
          По всем вопросам пишите в социальные сети.
        </p>
      </div>
    </section>
  );
}
