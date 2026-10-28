import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { FaqSchema, ServiceSchema } from "@/shared/ui/json-ld";
import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import LandingHero from "@/features/service-landings/ui/landing-hero";
import LandingLeadForm from "@/features/service-landings/ui/landing-lead-form";
import {
  CtaBand,
  DirectionCard,
  Faq,
  FeatureGrid,
  LandingSection,
  PriceGrid,
  SectionHeading,
  Steps,
  StickyCta,
} from "@/features/service-landings/ui/landing-ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Автопригон из Европы, Кореи, Китая и США в Беларусь | АВТОWAY" },
  description:
    "Пригон авто из-за границы под ключ: подбор, проверка, покупка, логистика, таможня и постановка на учёт. Европа, Корея, Китай, США. Полный расчёт до покупки.",
  alternates: { canonical: "/services/import" },
  openGraph: {
    title: "Автопригон из-за границы под ключ | АВТОWAY",
    description: "Авто из Европы, Кореи, Китая и США с проверкой, логистикой и таможенным сопровождением.",
    url: "/services/import",
    type: "website",
  },
};

const faq = [
  {
    question: "Сколько стоит пригон авто под ключ?",
    answer:
      "Услуга подбора и сопровождения — от 500 EUR (ориентир 2,5% от бюджета, но не менее 500 EUR). Дальше добавляются стоимость автомобиля, логистика и таможенные платежи. Полную смету считаем до покупки, чтобы не было сюрпризов.",
  },
  {
    question: "Можно ли пригнать конкретное авто, которое я нашёл?",
    answer:
      "Да. Пришлите ссылку на объявление или лот — проверим историю, состояние и юридическую чистоту, посчитаем полную стоимость до Беларуси и скажем, стоит ли брать.",
  },
  {
    question: "Сколько идёт автомобиль из-за границы?",
    answer:
      "Ориентировочно: Европа — 3–6 недель, Корея и Китай — 6–10 недель, США — 8–12 недель. Срок зависит от страны, площадки, логистики и таможни. После подбора даём более точный план.",
  },
  {
    question: "Как считается таможня?",
    answer:
      "По фактическим ставкам: пошлина, утилизационный сбор и таможенный сбор. Сумма зависит от возраста, объёма двигателя и стоимости авто. Мы считаем платёж заранее и закладываем его в общую смету.",
  },
  {
    question: "Можно ли привезти авто старше 5 лет?",
    answer:
      "Да, но таможенные платежи обычно выше, а требования к состоянию и документам строже. Перед покупкой считаем экономику: иногда выгоднее взять машину 3–5 лет.",
  },
  {
    question: "Что входит в сопровождение?",
    answer:
      "Подбор вариантов, проверка истории и состояния, торг, помощь с покупкой, логистика, таможенное оформление и подсказки по постановке на учёт. Вы получаете отчёт по каждому этапу.",
  },
  {
    question: "Можно ли купить авто без осмотра?",
    answer:
      "Не рекомендуем. Если автомобиль находится далеко, организуем проверку по доступным данным и фото/видео, а для дорогих лотов обсуждаем выездной осмотр. Решение всегда за вами — мы показываем риски.",
  },
];

export default async function ImportLandingPage() {
  const { contact } = await getServiceLandingContext("import");
  const phone = contact?.phone ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ServiceSchema
        name="Автопригон из-за границы"
        description="Подбор, проверка, покупка, доставка и таможенное сопровождение автомобилей из Европы, Кореи, Китая и США в Беларусь."
        url="/services/import"
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Автопригон" },
        ]}
      />
      <FaqSchema items={faq} />

      <LandingHero
        badge="Автопригон под ключ"
        title={
          <>
            Авто из-за границы <span className="text-primary">без лотереи и сюрпризов</span>
          </>
        }
        subtitle="Подбираем, проверяем, покупаем и доставляем автомобили из Европы, Кореи, Китая и США. Считаем полную стоимость до покупки: авто + логистика + таможня + оформление."
        primaryLabel="Рассчитать стоимость"
        secondaryLabel="Как это работает"
        secondaryHref="#process"
        phone={phone}
        stats={[
          { value: "4", label: "направления: Европа, Корея, Китай, США" },
          { value: "от 500 €", label: "услуга подбора и сопровождения" },
          { value: "договор", label: "и полный расчёт до покупки" },
        ]}
        chips={["Европа", "Корея", "Китай", "США"]}
        icon="globe"
        accent="blue"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Автопригон" },
        ]}
        visualLabel="Автопригон / мир"
      />

      <LandingSection>
        <SectionHeading
          badge="Направления"
          title="Откуда привозим автомобили"
          subtitle="У каждого рынка свои сильные стороны, сроки и нюансы таможни. Подберём направление под ваш бюджет и задачу."
          accent="blue"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DirectionCard
            country="Европа"
            flag="🇪🇺"
            text="Германия, Польша, Литва, Франция, Бельгия. Большой выбор ухоженных авто с историей обслуживания."
            meta="3–6 недель"
            accent="blue"
          />
          <DirectionCard
            country="Корея"
            flag="🇰🇷"
            text="Аукционы и внутренний рынок: свежие авто, богатые комплектации, понятная история."
            meta="6–10 недель"
            accent="emerald"
          />
          <DirectionCard
            country="Китай"
            flag="🇨🇳"
            text="Новые и б/у автомобили, электромобили и гибриды. Сильный выбор по оснащению."
            meta="6–10 недель"
            accent="amber"
          />
          <DirectionCard
            country="США"
            flag="🇺🇸"
            text="Аукционы и площадки: интересные лоты, но сложнее логистика и больше рисков по состоянию."
            meta="8–12 недель"
            accent="red"
          />
        </div>
      </LandingSection>

      <LandingSection className="pt-0">
        <SectionHeading
          badge="Что входит"
          title="Берём на себя весь путь — от ссылки до ключей"
          subtitle="Вы не переписываетесь с продавцом на другом языке, не считаете таможню вручную и не ищете перевозчика."
        />
        <FeatureGrid
          items={[
            {
              icon: "search",
              title: "Бриф и подбор",
              text: "Фиксируем бюджет, класс, пробег и требования. Ищем 3–5 реальных вариантов.",
            },
            {
              icon: "shield",
              title: "Проверка",
              text: "История, ДТП, пробег, юридическая чистота и состояние по фото, видео и отчётам.",
            },
            {
              icon: "document",
              title: "Документы и торг",
              text: "Помогаем с продавцом, договором, инвойсом и экспортными документами.",
            },
            {
              icon: "route",
              title: "Логистика",
              text: "Автовоз, паром или контейнер — выбираем маршрут под страну и бюджет.",
            },
            {
              icon: "dollar",
              title: "Таможня",
              text: "Считаем платежи заранее и сопровождаем оформление без «сюрпризов» на СВХ.",
            },
            {
              icon: "check",
              title: "Выдача",
              text: "Передаём автомобиль и документы, подсказываем по постановке на учёт.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection id="process">
        <SectionHeading
          badge="Процесс"
          title="Как проходит пригон"
          subtitle="Прозрачные этапы и понятные решения. Вы всегда знаете, на каком шаге находится автомобиль."
          accent="emerald"
        />
        <Steps
          accent="emerald"
          items={[
            {
              title: "Бриф",
              text: "Обсуждаем задачу, бюджет, страну, сроки и то, как вы будете использовать авто.",
              meta: "день 1",
            },
            {
              title: "Подбор",
              text: "Присылаем варианты с ценой, пробегом, историей и полной сметой до Беларуси.",
              meta: "2–5 дней",
            },
            {
              title: "Проверка и покупка",
              text: "Согласуем лучший вариант, проверяем документы и организуем сделку.",
              meta: "по лоту",
            },
            {
              title: "Доставка и оформление",
              text: "Логистика, таможня, СВХ и передача автомобиля с документами.",
              meta: "3–12 недель",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Экономика"
          title="Считаем полную стоимость до покупки"
          subtitle="Чтобы решение было осознанным, а не «потом разберёмся». Ниже — из чего складывается бюджет."
          accent="amber"
        />
        <PriceGrid
          accent="amber"
          items={[
            {
              title: "Подбор и сопровождение",
              price: "от 500 €",
              note: "Ориентир 2,5% от бюджета, но не менее 500 EUR.",
            },
            {
              title: "Логистика Европа → Минск",
              price: "от 500 €",
              note: "Зависит от страны, габаритов и загрузки автовоза.",
            },
            {
              title: "Корея / Китай / США",
              price: "по расчёту",
              note: "Считаем под конкретный лот и маршрут.",
            },
            {
              title: "Таможенные платежи",
              price: "по ставкам",
              note: "Пошлина, утильсбор и сбор — без наценки со стороны сервиса.",
            },
            {
              title: "Оформление и учёт",
              price: "по сборам",
              note: "Помогаем с постановкой на учёт и документами.",
            },
            {
              title: "Проверка конкретного авто",
              price: "в услуге",
              note: "Если вы уже нашли лот — проверим и посчитаем до покупки.",
              badge: "популярно",
            },
          ]}
          note="Суммы указаны как ориентир и не являются публичной офертой. Итоговая смета зависит от автомобиля, страны, курса валют и таможенных ставок на дату оформления."
        />
      </LandingSection>

      <LandingSection className="pt-0">
        <SectionHeading
          badge="Без иллюзий"
          title="Самостоятельный пригон — дешевле только на бумаге"
          subtitle="Иногда можно сэкономить. Но чаще — потерять время, деньги и нервы на одном неверном лоте."
          accent="red"
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-600">Самому</p>
            <h3 className="mt-2 text-xl font-bold text-white">Много неизвестных</h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-500">
              {[
                "Язык площадки, аукциона и переписки с продавцом.",
                "Скрытые повреждения, скрученный пробег, проблемы с документами.",
                "Курс валют, комиссии банка и неожиданные расходы.",
                "Таможня, СВХ и логистика — каждая ошибка стоит денег.",
                "Никто не отвечает за результат, кроме вас.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-zinc-900/60 to-zinc-950 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">С АВТОWAY</p>
            <h3 className="mt-2 text-xl font-bold text-white">Понятный маршрут</h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              {[
                "Один ответственный за подбор, проверку и доставку.",
                "Полная смета до покупки: авто, логистика, таможня, оформление.",
                "Проверка истории и состояния до сделки.",
                "Договор и отчёт по каждому этапу.",
                "Вы принимаете решение, мы убираем рутину и риски.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </LandingSection>

      <CtaBand
        title="Хотите узнать, сколько будет стоить ваше авто?"
        text="Пришлите ссылку на лот или опишите задачу — посчитаем полную стоимость до Беларуси и предложим варианты."
        primaryLabel="Получить расчёт"
        phone={phone}
        accent="blue"
      />

      <LandingSection>
        <SectionHeading badge="Частые вопросы" title="Что важно знать до старта" accent="blue" />
        <Faq items={faq} accent="blue" />
      </LandingSection>

      <LandingSection className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Расчёт</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Что поможет посчитать точнее</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-400">
              {[
                "Ссылка на объявление, лот или площадку.",
                "Бюджет: только авто или «под ключ».",
                "Страна и желаемые сроки.",
                "Класс, марка, пробег и важные опции.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-relaxed text-zinc-600">
              Если ссылки нет — не страшно. Опишите задачу словами, и мы предложим 2–3 направления.
            </p>
          </div>

          <LandingLeadForm
            topic="Автопригон"
            title="Получить расчёт пригона"
            description="Оставьте телефон — уточним задачу и вернёмся с ориентиром по бюджету."
            commentPlaceholder="Ссылка на авто или лот, бюджет, страна, сроки"
            submitLabel="Получить расчёт"
            accent="blue"
            phone={phone}
          />
        </div>
      </LandingSection>

      <StickyCta phone={phone} formLabel="Расчёт" />
    </div>
  );
}
