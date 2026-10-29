import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { FaqSchema, ServiceSchema } from "@/shared/ui/json-ld";
import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import LandingHero from "@/features/service-landings/ui/landing-hero";
import LandingLeadForm from "@/features/service-landings/ui/landing-lead-form";
import {
  CtaBand,
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
  title: { absolute: "Эвакуатор в Минске 24/7 — вызов и цены | АВТОWAY" },
  description:
    "Эвакуатор в Минске и по Беларуси: быстрая подача, полная погрузка, помощь после ДТП и перевозка авто в сервис. Цену фиксируем до выезда. Работаем круглосуточно.",
  alternates: { canonical: "/services/truck" },
  openGraph: {
    title: "Эвакуатор в Минске 24/7 | АВТОWAY",
    description: "Аккуратная эвакуация легковых авто, кроссоверов и микроавтобусов. По Минску и всей Беларуси.",
    url: "/services/truck",
    type: "website",
  },
};

const faq = [
  {
    question: "Сколько стоит эвакуатор по Минску?",
    answer:
      "Легковой автомобиль — от 100 BYN по Минску. Итоговая цена зависит от класса авто, сложности погрузки и адреса. Диспетчер называет стоимость до выезда, после погрузки она не меняется.",
  },
  {
    question: "Как быстро приедет эвакуатор?",
    answer:
      "По Минску обычно 15–30 минут. В часы пик и за городом время подачи может быть больше — диспетчер сразу назовёт реалистичный срок и не будет обещать невозможное.",
  },
  {
    question: "Можно ли вызвать эвакуатор после ДТП?",
    answer:
      "Да. Работаем с автомобилями после ДТП, с повреждённой подвеской, заблокированными колёсами и рулём. Используем лебёдку, подкатные тележки и мягкие стропы, чтобы не повредить кузов и днище.",
  },
  {
    question: "Что делать, если колёса заблокированы?",
    answer:
      "Сообщите об этом диспетчеру. Под такие случаи берём дополнительные приспособления: подкатные тележки, лебёдку и стропы. Стоимость сложной погрузки согласуем заранее.",
  },
  {
    question: "Сколько стоит эвакуация за МКАД?",
    answer:
      "За пределами Минска действует километровый тариф — от 1,50 BYN за километр. Обычно учитывается путь в обе стороны. Точную сумму диспетчер рассчитает по маршруту до выезда.",
  },
  {
    question: "Перевозите ли микроавтобусы и кроссоверы?",
    answer:
      "Да, перевозим легковые авто, кроссоверы, минивэны, микроавтобусы и мототехнику. Для тяжёлых и нестандартных автомобилей стоимость рассчитывается индивидуально.",
  },
];

export default async function EvacuationLandingPage() {
  const { contact } = await getServiceLandingContext("truck");
  const phone = contact?.phone ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ServiceSchema
        name="Эвакуатор в Минске"
        description="Круглосуточная эвакуация автомобилей по Минску и Беларуси: после ДТП, при поломке, перевозка в сервис, полная погрузка."
        url="/services/truck"
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Эвакуатор" },
        ]}
      />
      <FaqSchema items={faq} />

      <LandingHero
        badge="Эвакуация 24/7"
        title={
          <>
            Эвакуатор, который приедет <span className="text-primary">раньше, чем паника</span>
          </>
        }
        subtitle="Аккуратно погрузим и доставим авто в сервис, на стоянку или по адресу. По Минску и всей Беларуси. Стоимость фиксируем до выезда."
        primaryLabel="Вызвать эвакуатор"
        secondaryLabel="Позвонить"
        phone={phone}
        stats={[
          { value: "15–30", label: "минут — ориентировочная подача по Минску" },
          { value: "24/7", label: "принимаем заявки днём и ночью" },
          { value: "от 100", label: "BYN за легковой автомобиль по городу" },
        ]}
        chips={["Полная погрузка", "Лебедка", "После ДТП", "Межгород"]}
        icon="truck"
        accent="red"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Эвакуатор" },
        ]}
        visualLabel="Эвакуатор / Минск"
        statusLabel="24/7"
      />

      <LandingSection>
        <SectionHeading
          badge="Когда нужен эвакуатор"
          title="Автомобиль не должен оставаться там, где он встал"
          subtitle="Заберём машину из двора, с трассы, парковки или места ДТП. Доставим туда, где её действительно ждут."
        />
        <FeatureGrid
          items={[
            {
              icon: "shield",
              title: "После ДТП",
              text: "Повреждённый кузов, разбитые стёкла, неработающие колёса — аккуратно погрузим и увезём.",
            },
            {
              icon: "gauge",
              title: "Не заводится или не едет",
              text: "Двигатель, коробка, электрика или топливная система — не рискуем ехать своим ходом.",
            },
            {
              icon: "key",
              title: "Заблокированы колёса",
              text: "Используем подкатные тележки, лебёдку и мягкие стропы, чтобы не тянуть авто волоком.",
            },
            {
              icon: "car",
              title: "Перевозка в сервис",
              text: "Доставим в выбранный автосервис или на СТО АВТОWAY — без переплат за «свой» сервис.",
            },
            {
              icon: "route",
              title: "Межгород",
              text: "Минск — область, областные центры и обратно. Рассчитаем маршрут и назовём цену заранее.",
            },
            {
              icon: "calendar",
              title: "После покупки",
              text: "Заберём автомобиль из другого города или с площадки и привезём к месту оформления.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection className="pt-0">
        <SectionHeading
          badge="Почему спокойно"
          title="Не просто «увезти», а довезти без новых повреждений"
          subtitle="Эвакуация — это не гонка. Это аккуратная работа с техникой, креплениями и ответственностью за ваш автомобиль."
          accent="amber"
        />
        <FeatureGrid
          accent="amber"
          columns={3}
          items={[
            {
              icon: "dollar",
              title: "Цена до выезда",
              text: "Называем стоимость по телефону и фиксируем её. Без «доплат на месте» за погрузку.",
            },
            {
              icon: "shield",
              title: "Полная погрузка",
              text: "Автомобиль стоит на платформе целиком — без буксировки на тросе и риска для подвески.",
            },
            {
              icon: "camera",
              title: "Фотофиксация",
              text: "Фиксируем состояние автомобиля до погрузки и после доставки.",
            },
            {
              icon: "clock",
              title: "24/7",
              text: "Ночь, выходные и праздники — принимаем заявки и выезжаем.",
            },
            {
              icon: "users",
              title: "Опытный водитель",
              text: "Не просто водитель эвакуатора, а человек, который понимает, как крепить авто.",
            },
            {
              icon: "phone",
              title: "Обратная связь",
              text: "Сообщим, когда эвакуатор выехал, и предупредим, если время подачи изменится.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Как это работает"
          title="Четыре шага — и автомобиль уже в пути"
          subtitle="Чем точнее информация, тем быстрее мы назовём цену и подадим эвакуатор."
          accent="blue"
        />
        <Steps
          accent="blue"
          items={[
            {
              title: "Заявка",
              text: "Звонок или форма: адрес, марка и модель, что случилось, куда везти.",
              meta: "2 минуты",
            },
            {
              title: "Расчёт",
              text: "Диспетчер называет стоимость и ориентировочное время подачи. Цена фиксируется.",
              meta: "до выезда",
            },
            {
              title: "Подача и погрузка",
              text: "Эвакуатор приезжает, водитель оценивает авто и аккуратно загружает его на платформу.",
              meta: "15–30 мин",
            },
            {
              title: "Доставка",
              text: "Привозим по адресу, в сервис или на стоянку. Вы принимаете автомобиль.",
              meta: "по маршруту",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Цены"
          title="Прозрачные тарифы без сюрпризов"
          subtitle="Ниже — ориентиры. Точная стоимость зависит от класса автомобиля, адреса и сложности погрузки."
          accent="amber"
        />
        <PriceGrid
          accent="amber"
          items={[
            { title: "Легковой автомобиль по Минску", price: "от 100 BYN", note: "Седаны, хэтчбеки, универсалы." },
            { title: "Кроссовер, минивэн, джип", price: "от 120 BYN", note: "Полная погрузка на платформу." },
            { title: "После ДТП / сложная погрузка", price: "от 150 BYN", note: "Лебёдка, тележки, мягкие стропы.", badge: "частый запрос" },
            { title: "За МКАД", price: "от 1,50 BYN", unit: "за км", note: "Обычно считается путь в обе стороны." },
            { title: "Мототехника", price: "от 70 BYN", note: "Мотоциклы, скутеры, квадроциклы." },
            { title: "Микроавтобус", price: "от 150 BYN", note: "Зависит от массы и габаритов." },
            { title: "Простой эвакуатора", price: "от 50 BYN", unit: "за час", note: "Если ожидание по просьбе клиента." },
            { title: "Срочный вызов", price: "по расчёту", note: "Сообщите, что горит — предложим ближайший экипаж." },
            { title: "Прикурить / подвезти топливо", price: "от 50 BYN", note: "Помощь на дороге без эвакуации." },
          ]}
          note="Цены указаны как ориентир и не являются публичной офертой. Итоговая стоимость согласуется до выезда и фиксируется в заявке."
        />
      </LandingSection>

      <CtaBand
        title="Нужен эвакуатор прямо сейчас?"
        text="Позвоните — уточним адрес, автомобиль и ближайшее свободное время. Или оставьте заявку, и мы перезвоним."
        primaryLabel="Оставить заявку"
        phone={phone}
        accent="red"
      />

      <LandingSection>
        <SectionHeading
          badge="Частые вопросы"
          title="Что обычно спрашивают перед вызовом"
          accent="blue"
        />
        <Faq items={faq} accent="blue" />
      </LandingSection>

      <LandingSection className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Диспетчер</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Что сообщить, чтобы мы приехали быстрее</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-400">
              {[
                "Адрес или координаты, где стоит автомобиль.",
                "Марку, модель и примерную массу.",
                "Что случилось: ДТП, не заводится, заблокированы колёса.",
                "Куда везти: сервис, стоянка или конкретный адрес.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-5 text-sm font-medium text-white transition hover:border-zinc-500"
              >
                <span className="text-primary">●</span>
                {phone}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              Работаем по Минску и всей Беларуси. Для межгорода лучше оставить заявку заранее — подберём свободный экипаж.
            </p>
          </div>

          <LandingLeadForm
            topic="Эвакуатор"
            serviceSlug="truck"
            title="Вызвать эвакуатор"
            description="Оставьте телефон — перезвоним, уточним адрес и назовём стоимость."
            commentPlaceholder="Адрес, автомобиль, что случилось и куда везти"
            submitLabel="Вызвать эвакуатор"
            accent="red"
            phone={phone}
          />
        </div>
      </LandingSection>

      <StickyCta phone={phone} formLabel="Вызвать" />
    </div>
  );
}
