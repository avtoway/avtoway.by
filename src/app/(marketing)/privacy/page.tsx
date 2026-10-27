import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | АВТОWAY",
  description: "Как АВТОWAY обрабатывает персональные данные, оставленные в формах на сайте.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-28">
      <div className="mx-auto max-w-3xl px-6">
        <nav className="mb-6 text-xs text-zinc-500">
          <Link href="/" className="hover:text-white">Главная</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-400">Политика конфиденциальности</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Политика конфиденциальности</h1>
        <p className="mt-3 text-sm text-zinc-500">Редакция от 27.10.2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-400">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Какие данные мы собираем</h2>
            <p>
              Через формы на сайте вы можете оставить имя, телефон, email, город, параметры автомобиля и комментарий.
              Эти данные вы сообщаете добровольно, чтобы мы могли связаться с вами и подготовить предложение.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Зачем они нужны</h2>
            <p>
              Мы используем данные только для обработки вашей заявки: уточнения задачи, подбора автомобиля,
              расчёта стоимости и связи по указанным контактам. Мы не продаём автомобили и не передаём ваши
              данные третьим лицам, кроме случаев, предусмотренных законодательством.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Хранение и удаление</h2>
            <p>
              Данные хранятся на серверах, обеспечивающих их защиту, и не дольше, чем это нужно для обработки
              обращения. Вы можете попросить удалить свои данные, написав нам на{" "}
              <a href="mailto:info@avtoway.by" className="text-blue-400 hover:text-blue-300">info@avtoway.by</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Cookies и аналитика</h2>
            <p>
              Сайт может использовать технические cookies и обезличенную статистику посещений, чтобы понимать,
              какие страницы полезны. Мы не используем данные для рекламного профилирования без вашего согласия.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-white">Контакты</h2>
            <p>
              По вопросам обработки данных:{" "}
              <a href="mailto:info@avtoway.by" className="text-blue-400 hover:text-blue-300">info@avtoway.by</a>{" "}
              или через <Link href="/contacts" className="text-blue-400 hover:text-blue-300">страницу контактов</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
