import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Справка по админке",
  robots: { index: false, follow: false },
};

const DOCS = [
  {
    file: "admin-guide.docx",
    title: "Руководство по админке",
    desc: "Вход, роли, все разделы: услуги, заявки, аренда, продажа, автоподбор, блог, отчёты, почта, уведомления и типовые ошибки.",
  },
  {
    file: "seo-guide.docx",
    title: "SEO-руководство",
    desc: "Как устроен поиск, семантика, метатеги, контент, Google Search Console и Яндекс Вебмастер, локальное SEO и план на 90 дней.",
  },
  {
    file: "ads-guide.docx",
    title: "Реклама и монетизация",
    desc: "Google Ads, Яндекс Директ, YouTube, Instagram и Telegram: бюджеты, настройка, UTM. Монетизация через AdSense, Яндекс.Рекламу и прямых партнёров.",
  },
];

const QUICK_START = [
  {
    title: "1. Заполните контакты",
    text: "Телефон, email, мессенджеры и адрес подставляются в шапку, футер, договоры и отчёты.",
    href: "/admin/contacts",
  },
  {
    title: "2. Проверьте услуги",
    text: "Список услуг — единственный источник правды. Скрытая услуга исчезает из меню, главной, карточек и футера.",
    href: "/admin/services",
  },
  {
    title: "3. Настройте уведомления",
    text: "Telegram-бот и email-дубль, чтобы не пропускать заявки.",
    href: "/admin/notifications",
  },
  {
    title: "4. Подключите аналитику",
    text: "GA4 и Яндекс.Метрика загружаются только после согласия посетителя. Там же — верификация Search Console и Вебмастера.",
    href: "/admin/analytics",
  },
  {
    title: "5. Запустите SEO",
    text: "Заполните метатеги, опубликуйте статьи и кейсы, отправьте sitemap в поисковики.",
    href: "/admin/blog",
  },
  {
    title: "6. Спланируйте рекламу",
    text: "Кампании, бюджеты, UTM и рекламные блоки для монетизации сайта.",
    href: "/admin/promotion",
  },
];

const GLOSSARY = [
  {
    term: "Slug (короткий адрес)",
    text: "Часть ссылки на английском: kia-rio-2022 → /services/rent/kia-rio-2022. Только строчные латинские буквы, цифры и дефис.",
  },
  {
    term: "Черновик / Активен",
    text: "Переключатель видимости. Выключено — клиенты не видят, но данные остаются в базе.",
  },
  {
    term: "UTM-метка",
    text: "Хвостик к ссылке, который показывает, из какого ролика или объявления пришёл клиент.",
  },
  {
    term: "SEO-заголовок и описание",
    text: "То, как страница выглядит в выдаче Google и Яндекса.",
  },
  {
    term: "OG-картинка",
    text: "Превью ссылки в Telegram, Viber и WhatsApp.",
  },
  {
    term: "SMTP и IMAP",
    text: "SMTP отправляет письма с сайта, IMAP забирает входящие письма в админку.",
  },
];

const DAILY = [
  {
    when: "Утром, 5 минут",
    text: "Откройте «Заявки»: новые — прозвонить, перевести в «В работе» и поставить дату следующего контакта. Затем «Задачи»: просроченные горят красным.",
  },
  {
    when: "Выдали или вернули авто",
    text: "В «Аренде» поставьте или очистите дату «Забронирован до». Договор печатается кнопкой «Договор» во вкладке «Заявки».",
  },
  {
    when: "После осмотра",
    text: "В «Отчётах» нажмите «Новый отчёт», заполните чек-лист и фото, включите «Опубликовать по ссылке» и отправьте ссылку клиенту.",
  },
  {
    when: "Раз в неделю",
    text: "Добавьте 1 реальный кейс в «Автоподбор → Кейсы» и 1 статью в «Блог».",
  },
];

const FAQ = [  {
    q: "Что происходит, если скрыть услугу?",
    a: "Услуга с выключенным статусом не попадает в каталог /services, меню, hero на главной, блок задач, кросс-продажи, футер и sitemap. Её посадочная страница начинает отдавать 404, пока услуга выключена. Данные не удаляются: включите статус обратно — страница снова заработает.",
  },
  {
    q: "Почему заявка не пришла в Telegram?",
    a: "Проверьте /admin/notifications: токен бота, Chat ID и переключатель. Ошибки отправки пишутся в /admin/monitoring. Email-дубль работает только при настроенном SMTP в /admin/email и заполненном email в /admin/contacts.",
  },
  {
    q: "Как выдавать доступы сотрудникам?",
    a: "Создайте роль в /admin/roles с нужными правами, затем сотрудника в /admin/users и назначьте ему роль. Иерархия ролей не даёт выдать права выше своих.",
  },
  {
    q: "Куда попадают заявки со всех форм?",
    a: "В единую ленту /admin/requests. Видны только те источники, на которые у сотрудника есть права. Клиенты и задачи — в /admin/clients и /admin/tasks.",
  },
  {
    q: "Как скачать инструкции?",
    a: "На этой странице, карточки ниже. Файлы в формате .docx открываются в Word, Google Docs и LibreOffice. Скачивание доступно только после входа в админку.",
  },
  {
    q: "Можно ли автоматически купить рекламу из админки?",
    a: "Нет. Google Ads, Яндекс Директ, YouTube, AdSense и Яндекс.Реклама требуют аккаунт, модерацию и платёжное средство. Админка помогает спланировать кампании, собрать UTM-ссылки, вести бюджет и считать показы/клики рекламных блоков на сайте.",
  },
];

export default function AdminHelpPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Справка</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-500">
          Инструкции по админке, SEO и рекламе. Скачайте Word-файлы — их можно распечатать,
          отправить сотруднику или подрядчику.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Документы</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {DOCS.map(doc => (
            <article key={doc.file} className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <h3 className="font-semibold text-white">{doc.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{doc.desc}</p>
              <a
                href={`/api/docs/${doc.file}`}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Скачать .docx
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Быстрый старт</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_START.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-red-500/40"
            >
              <h3 className="text-sm font-semibold text-white group-hover:text-red-200">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Шпаргалка на каждый день</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DAILY.map(item => (
            <div key={item.when} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <h3 className="text-sm font-semibold text-white">{item.when}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Словарь терминов</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {GLOSSARY.map(item => (
            <div key={item.term} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <dt className="text-sm font-semibold text-white">{item.term}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-400">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">Частые вопросы</h2>
        <div className="space-y-2">
          {FAQ.map(item => (
            <details key={item.q} className="group rounded-xl border border-slate-800 bg-slate-900/30 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-200 marker:hidden">
                <span className="mr-2 inline-block text-red-400 transition group-open:rotate-90">›</span>
                {item.q}
              </summary>
              <p className="mt-2 pl-4 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-xs leading-relaxed text-slate-500">
        Технические детали для разработчика — в <code className="text-slate-300">docs/operations.md</code>.
        Если инструкция устарела, обновите её командой <code className="text-slate-300">npm run docs:build</code>.
      </div>
    </div>
  );
}
