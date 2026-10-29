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
  title: { absolute: "Автосервис в Минске — диагностика, ремонт и ТО | АВТОWAY" },
  description:
    "Автосервис АВТОWAY в Минске: компьютерная диагностика, ТО, замена масла, ремонт подвески, тормозов, двигателя и АКПП. Смета до работ, фото дефектовки, гарантия на работы.",
  alternates: { canonical: "/services/service" },
  openGraph: {
    title: "Автосервис в Минске | АВТОWAY",
    description: "Ремонт без сюрпризов: диагностика, честная дефектовка и согласование сметы до начала работ.",
    url: "/services/service",
    type: "website",
  },
};

const faq = [
  {
    question: "Сколько стоит диагностика?",
    answer:
      "Диагностика подвески — от 25 BYN, компьютерная диагностика — от 30 BYN. Точная стоимость зависит от автомобиля и того, что нужно проверить. Перед работами согласуем смету.",
  },
  {
    question: "Можно ли приехать со своими запчастями?",
    answer:
      "Да, по согласованию. Мы подскажем, какие детали нужны, и проверим их применимость. Гарантия при этом распространяется на выполненные работы, а не на деталь клиента.",
  },
  {
    question: "Даёте ли гарантию на работы?",
    answer:
      "Да, на выполненные работы даём гарантию. Если после ремонта остался вопрос — вернитесь, разберёмся. Гарантийные условия фиксируем в заказ-наряде.",
  },
  {
    question: "Сколько времени занимает ремонт?",
    answer:
      "Простые работы — замена масла, колодок, диагностика — обычно в день обращения. Сложный ремонт зависит от наличия запчастей. После дефектовки называем реалистичный срок, а не «через час».",
  },
  {
    question: "Можно ли приехать без записи?",
    answer:
      "Лучше записаться заранее — так вы не будете ждать в очереди. Если срочно, позвоните: подскажем, есть ли свободное окно сегодня.",
  },
  {
    question: "Работаете с любыми марками?",
    answer:
      "Обслуживаем легковые автомобили европейских, азиатских и американских марок. По редким моделям уточняйте — подскажем, сможем ли помочь и какие есть нюансы.",
  },
  {
    question: "Можно ли проверить авто перед покупкой?",
    answer:
      "Да. Проведём диагностику кузова, подвески, двигателя и электроники, покажем дефекты и поможем понять, стоит ли автомобиль своих денег.",
  },
];

export default async function AutoServiceLandingPage() {
  const { contact } = await getServiceLandingContext("service");
  const phone = contact?.phone ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ServiceSchema
        name="Автосервис в Минске"
        description="Диагностика, техническое обслуживание и ремонт легковых автомобилей: подвеска, тормоза, двигатель, АКПП, электрика, кондиционер."
        url="/services/service"
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Автосервис" },
        ]}
      />
      <FaqSchema items={faq} />

      <LandingHero
        badge="Автосервис АВТОWAY"
        title={
          <>
            Ремонт <span className="text-primary">без сюрпризов</span>{" "}
            <br className="hidden sm:block" />
            Сначала диагноз — потом работы
          </>
        }
        subtitle="Диагностика, ТО и ремонт легковых автомобилей. Показываем дефектовку, согласуем смету и не делаем лишнего. Работаем с европейскими, азиатскими и американскими марками."
        primaryLabel="Записаться на сервис"
        secondaryLabel="Позвонить"
        phone={phone}
        stats={[
          { value: "от 25", label: "BYN — диагностика подвески" },
          { value: "от 48", label: "BYN — нормо-час работ" },
          { value: "гарантия", label: "на выполненные работы" },
        ]}
        chips={["Диагностика", "ТО и масло", "Подвеска", "Тормоза"]}
        icon="wrench"
        accent="emerald"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Автосервис" },
        ]}
        visualLabel="Автосервис / Минск"
      />

      <LandingSection>
        <SectionHeading
          badge="Что делаем"
          title="От простого ТО до сложного ремонта"
          subtitle="Не нужно ехать в три места. Диагностика, слесарный ремонт и обслуживание — в одном сервисе."
          accent="emerald"
        />
        <FeatureGrid
          accent="emerald"
          columns={3}
          items={[
            {
              icon: "search",
              title: "Диагностика",
              text: "Компьютерная, подвеска, двигатель, электроника. Объясняем, что нашли и почему это важно.",
            },
            {
              icon: "fuel",
              title: "ТО и масло",
              text: "Замена масла, фильтров и технических жидкостей. Подбираем расходники под ваш автомобиль.",
            },
            {
              icon: "car",
              title: "Подвеска и рулевое",
              text: "Амортизаторы, рычаги, сайлентблоки, шаровые, рулевые тяги и развал-схождение.",
            },
            {
              icon: "shield",
              title: "Тормозная система",
              text: "Колодки, диски, суппорты, тормозные шланги и жидкость. Проверяем безопасность.",
            },
            {
              icon: "gauge",
              title: "Двигатель и ГРМ",
              text: "Диагностика, замена ремней и цепей ГРМ, устранение течей и посторонних звуков.",
            },
            {
              icon: "bolt",
              title: "Электрика",
              text: "Аккумулятор, генератор, стартер, датчики, проводка и ошибки электронных систем.",
            },
            {
              icon: "wrench",
              title: "АКПП и МКПП",
              text: "Диагностика, замена масла, ремонт сцепления и работы по трансмиссии.",
            },
            {
              icon: "clock",
              title: "Кондиционер",
              text: "Диагностика, заправка и ремонт системы кондиционирования.",
            },
            {
              icon: "route",
              title: "Шиномонтаж",
              text: "Сезонная замена шин, балансировка и подготовка автомобиля к сезону.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection className="pt-0">
        <SectionHeading
          badge="Подход"
          title="Сначала диагноз, потом ремонт"
          subtitle="Никаких «на всякий случай заменим всё». Сначала находим причину, затем согласуем работы и стоимость."
          accent="blue"
        />
        <FeatureGrid
          accent="blue"
          columns={3}
          items={[
            {
              icon: "camera",
              title: "Показываем дефекты",
              text: "Фото и видео проблемных узлов — чтобы вы видели, за что платите.",
            },
            {
              icon: "document",
              title: "Смета заранее",
              text: "Список работ и запчастей согласуем до начала ремонта. Без неожиданных строк в счёте.",
            },
            {
              icon: "users",
              title: "Профильный подход",
              text: "Техническое образование и практика: понимаем устройство автомобиля, а не только меняем детали.",
            },
            {
              icon: "check",
              title: "Проверка после ремонта",
              text: "Проверяем результат и объясняем, на что обратить внимание дальше.",
            },
            {
              icon: "shield",
              title: "Гарантия",
              text: "На выполненные работы — гарантия. Условия фиксируем в заказ-наряде.",
            },
            {
              icon: "phone",
              title: "Обратная связь",
              text: "Сообщим, если в процессе найден ещё какой-то дефект, и согласуем действия.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Как проходит визит"
          title="Пять шагов — и вы снова за рулём"
          subtitle="Без туманных формулировок и ремонта «по наитию»."
          accent="emerald"
        />
        <Steps
          accent="emerald"
          columns={5}
          items={[
            {
              title: "Заявка",
              text: "Опишите симптом или задачу. Подскажем, когда удобнее приехать.",
              meta: "5 минут",
            },
            {
              title: "Диагностика",
              text: "Осматриваем автомобиль, считываем ошибки, проверяем узлы на подъёмнике.",
              meta: "20–60 мин",
            },
            {
              title: "Смета",
              text: "Показываем дефектовку, называем стоимость работ и запчастей. Согласуем.",
              meta: "до работ",
            },
            {
              title: "Ремонт",
              text: "Выполняем согласованные работы. Если что-то меняется — сначала согласуем.",
              meta: "по объёму",
            },
            {
              title: "Выдача",
              text: "Проверяем результат, объясняем выполненные работы и отдаём автомобиль.",
              meta: "после проверки",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Цены"
          title="Ориентиры по стоимости работ"
          subtitle="Ниже — «от» за работу без стоимости запчастей. Итоговая смета — после диагностики."
          accent="amber"
        />
        <PriceGrid
          accent="amber"
          items={[
            { title: "Диагностика подвески", price: "от 25 BYN", note: "Осмотр на подъёмнике, дефектовка." },
            { title: "Компьютерная диагностика", price: "от 30 BYN", note: "Считывание и расшифровка ошибок." },
            { title: "Замена масла и фильтра", price: "от 30 BYN", note: "Без стоимости расходников.", badge: "часто" },
            { title: "Полное ТО", price: "от 45 BYN", note: "Масло, фильтры и базовые проверки." },
            { title: "Замена тормозных колодок", price: "от 30 BYN", note: "За ось, без стоимости колодок." },
            { title: "Замена амортизаторов", price: "от 60 BYN", note: "За ось, зависит от конструкции." },
            { title: "Развал-схождение", price: "от 35 BYN", note: "Регулировка углов установки колёс." },
            { title: "Нормо-час", price: "от 48 BYN", note: "Для работ, которые считаются по времени." },
            { title: "Шиномонтаж", price: "от 10 BYN", note: "За колесо, без балансировки." },
            { title: "Замена сцепления", price: "от 100 BYN", note: "Зависит от привода и конструкции." },
            { title: "Замена антифриза", price: "от 15 BYN", note: "Без стоимости жидкости." },
            { title: "Замена сайлентблоков", price: "от 15 BYN", note: "За элемент, зависит от рычага." },
          ]}
          note="Цены указаны как ориентир и не являются публичной офертой. Стоимость работ зависит от марки, модели и сложности. Все работы согласуем до начала."
        />
      </LandingSection>

      <CtaBand
        title="Что-то стучит, горит или не работает?"
        text="Не тяните до поломки. Запишитесь на диагностику — посмотрим, объясним и предложим решение."
        primaryLabel="Записаться"
        phone={phone}
        accent="emerald"
      />

      <LandingSection>
        <SectionHeading badge="Частые вопросы" title="Что спрашивают перед визитом" accent="emerald" />
        <Faq items={faq} accent="emerald" />
      </LandingSection>

      <LandingSection className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Запись</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Что взять с собой</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-400">
              {[
                "Свидетельство о регистрации автомобиля.",
                "Ключи и, если есть, второй ключ.",
                "Описание симптома: когда появляется, как часто, на какой скорости.",
                "Сервисную книжку, если ведёте историю обслуживания.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-5 text-sm font-medium text-white transition hover:border-zinc-500"
              >
                <span className="text-emerald-400">●</span>
                {phone}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              Если не уверены, что именно случилось — просто опишите словами. Подскажем, с чего начать.
            </p>
          </div>

          <LandingLeadForm
            topic="Автосервис"
            serviceSlug="service"
            title="Записаться на сервис"
            description="Оставьте телефон — уточним задачу и предложим удобное время."
            commentPlaceholder="Марка, модель, что случилось или какие работы нужны"
            submitLabel="Записаться"
            accent="emerald"
            phone={phone}
          />
        </div>
      </LandingSection>

      <StickyCta phone={phone} formLabel="Записаться" />
    </div>
  );
}
