import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { FaqSchema, ServiceSchema } from "@/shared/ui/json-ld";
import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import LandingHero from "@/features/service-landings/ui/landing-hero";
import LandingLeadForm from "@/features/service-landings/ui/landing-lead-form";
import LandingIcon from "@/features/service-landings/ui/icon";
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
  title: { absolute: "Грузоперевозки в Минске — переезды квартир и офисов | АВТОWAY" },
  description:
    "Грузоперевозки и переезды в Минске: квартиры, офисы, мебель, техника и оборудование. Грузчики, упаковка, разборка мебели, межгород. Работаем с физлицами и юрлицами, наличный и безналичный расчёт. Цену фиксируем до выезда.",
  alternates: { canonical: "/services/moving" },
  openGraph: {
    title: "Грузоперевозки и переезды в Минске | АВТОWAY",
    description:
      "Квартирные и офисные переезды, грузовое такси, перевозка мебели и оборудования. Минск и Беларусь, для физлиц и бизнеса.",
    url: "/services/moving",
    type: "website",
  },
};

const faq = [
  {
    question: "Сколько стоит квартирный переезд в Минске?",
    answer:
      "Стоимость зависит от объёма вещей, этажа, наличия лифта, количества грузчиков и времени работы. Ориентир: машина с двумя грузчиками — от 90 BYN в час, минимальный заказ — 2 часа. Переезд однокомнатной квартиры обычно занимает 2–3 часа. Точную смету называем до выезда.",
  },
  {
    question: "Можно ли заказать только машину или только грузчиков?",
    answer:
      "Да. Можно заказать грузовое такси без грузчиков, отдельную бригаду грузчиков или всё вместе: машину, водителя и бригаду. Подберём вариант под задачу и бюджет.",
  },
  {
    question: "Как рассчитывается стоимость?",
    answer:
      "Складываем время работы машины и грузчиков, километраж за МКАД и дополнительные услуги: упаковку, разборку и сборку мебели, подъём без лифта, такелаж. Минимальный заказ — 2 часа. Основную стоимость фиксируем до выезда, доплаты согласуем заранее.",
  },
  {
    question: "Работаете с юридическими лицами и по безналу?",
    answer:
      "Да. Работаем с офисами, магазинами, складами и организациями. Для юрлиц — договор, счёт, акт выполненных работ и ТТН при необходимости. Для регулярных рейсов обсуждаем отдельные условия.",
  },
  {
    question: "Что входит в переезд под ключ?",
    answer:
      "Подбор машины и бригады, подача к адресу, погрузка, крепление груза, перевозка, разгрузка и подъём на этаж. По запросу добавляем упаковку, разборку и сборку мебели, расстановку вещей на новом месте.",
  },
  {
    question: "Как быстро можно заказать машину?",
    answer:
      "Если есть свободная машина, по Минску можем подать её в день обращения. Точное время диспетчер подтвердит при заказе. Для планового переезда лучше бронировать за 1–3 дня, особенно на выходные и конец месяца.",
  },
  {
    question: "Перевозите ли пианино, сейфы и оборудование?",
    answer:
      "Да, такие задачи обсуждаем отдельно. Нужно знать вес, габариты, этаж и наличие лифта. Для тяжёлых и нестандартных предметов подбираем бригаду, такелажные приспособления и способ погрузки.",
  },
  {
    question: "Работаете ли по Беларуси?",
    answer:
      "Да. Выполняем междугородние перевозки: Минск — областные центры и другие города, а также обратные рейсы. Стоимость зависит от расстояния, объёма и времени. Для организаций оформляем ТТН.",
  },
  {
    question: "Нужна ли упаковка вещей?",
    answer:
      "Не обязательна, но для мебели, техники, стекла и хрупких вещей рекомендуем. Можем привезти упаковочные материалы или работать с вашими. Упаковка снижает риск повреждений и экономит время на погрузке.",
  },
  {
    question: "Бывают ли доплаты на месте?",
    answer:
      "Если состав заказа не меняется — нет. Доплаты возможны за подъём без лифта, пеший перенос на большое расстояние, ночное время и простой сверх согласованного. Все такие условия обсуждаем до начала работ.",
  },
];

export default async function MovingLandingPage() {
  const { contact } = await getServiceLandingContext("moving");
  const phone = contact?.phone ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <ServiceSchema
        name="Грузоперевозки и переезды в Минске"
        description="Квартирные и офисные переезды, грузовое такси, перевозка мебели, техники и оборудования, грузчики, упаковка и межгород по Беларуси."
        url="/services/moving"
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Грузоперевозки" },
        ]}
      />
      <FaqSchema items={faq} />

      <LandingHero
        badge="Переезды и грузоперевозки"
        title={
          <>
            Грузоперевозки <span className="text-primary">без хаоса</span>
          </>
        }
        subtitle="Квартиры, офисы, мебель, техника и оборудование. Подберём машину и грузчиков, упакуем и перевезём. Работаем по Минску и всей Беларуси — с физлицами и юрлицами."
        primaryLabel="Рассчитать переезд"
        secondaryLabel="Позвонить"
        phone={phone}
        stats={[
          { value: "от 40", label: "BYN/час — машина по Минску" },
          { value: "от 25", label: "BYN/час — грузчик" },
          { value: "2 ч", label: "минимальный заказ" },
        ]}
        chips={["Квартиры", "Офисы", "Грузчики", "Межгород"]}
        icon="boxes"
        accent="amber"
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/services" },
          { label: "Грузоперевозки" },
        ]}
        visualLabel="Грузоперевозки / Минск"
      />

      <LandingSection>
        <SectionHeading
          badge="Что перевозим"
          title="От коробок до офиса — одна команда"
          subtitle="Подбираем транспорт под объём, а бригаду — под этажность и характер груза. Не нужно искать машину и грузчиков отдельно."
          accent="amber"
        />
        <FeatureGrid
          accent="amber"
          columns={3}
          items={[
            {
              icon: "key",
              title: "Квартирный переезд",
              text: "Комнаты, кухня, мебель, техника и коробки. Подберём машину по объёму и бригаду по этажам.",
            },
            {
              icon: "users",
              title: "Офисный переезд",
              text: "Столы, техника, документы и торговое оборудование. Работаем по согласованному графику.",
            },
            {
              icon: "truck",
              title: "Грузовое такси",
              text: "Машина с водителем для перевозки мебели, техники, стройматериалов и паллет.",
            },
            {
              icon: "boxes",
              title: "Мебель и техника",
              text: "Диваны, шкафы, холодильники, стиральные машины. Упакуем и закрепим, чтобы не повредить.",
            },
            {
              icon: "wrench",
              title: "Оборудование и магазины",
              text: "Торговые стеллажи, витрины, станки и паллеты. Для бизнеса — с документами.",
            },
            {
              icon: "home",
              title: "Дача и коттедж",
              text: "Переезд за город, сезонные вещи, садовая техника и мебель. Рассчитаем километраж.",
            },
            {
              icon: "boxes",
              title: "Склад и паллеты",
              text: "Погрузка и разгрузка фур, паллеты, гидроборт и рохля — по запросу.",
            },
            {
              icon: "users",
              title: "Грузчики отдельно",
              text: "Погрузка, разгрузка, подъём на этаж и перестановка мебели без машины.",
            },
            {
              icon: "route",
              title: "Межгород по Беларуси",
              text: "Минск — областные центры и обратно. Для организаций оформляем ТТН.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection className="pt-0">
        <SectionHeading
          badge="Для кого"
          title="Частным клиентам и бизнесу"
          subtitle="У физлиц — переезд без суеты. У компаний — понятный подрядчик, документы и согласованный график."
          accent="blue"
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/25 via-zinc-900/60 to-zinc-950 p-6 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-400">
              <LandingIcon name="home" className="h-5 w-5" />
            </span>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              Частным клиентам
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">Переезд без лишней нагрузки</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Приедем, аккуратно вынесем, погрузим и расставим вещи на новом месте. Вам не нужно
              просить друзей и искать машину по объявлениям.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              {[
                "Квартира, дом, дача или переезд к родственникам.",
                "Мебель, бытовая техника, коробки и хрупкие вещи.",
                "Грузчики, упаковка, разборка и сборка мебели.",
                "Наличный и безналичный расчёт.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-0.5 text-amber-400">
                    <LandingIcon name="check" className="h-4 w-4" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="#lead"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-amber-400"
            >
              Рассчитать переезд
              <LandingIcon name="arrow-right" className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-950/25 via-zinc-900/60 to-zinc-950 p-6 sm:p-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/25 bg-blue-500/10 text-blue-400">
              <LandingIcon name="users" className="h-5 w-5" />
            </span>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300">
              Юридическим лицам
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">Логистика без сюрпризов для бухгалтерии</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Организуем офисный переезд, перевозку товара и оборудования. Работаем по договору,
              согласуем время и предоставляем закрывающие документы.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-zinc-400">
              {[
                "Офисы, магазины, склады и торговое оборудование.",
                "Разовые рейсы и регулярная доставка по адресам.",
                "Договор, счёт, акт выполненных работ, ТТН.",
                "Безналичный расчёт и согласованный график.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-0.5 text-blue-400">
                    <LandingIcon name="check" className="h-4 w-4" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a
              href="#lead"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-5 text-sm font-semibold text-blue-200 transition hover:-translate-y-0.5 hover:border-blue-300/50 hover:text-white"
            >
              Запросить счёт
              <LandingIcon name="arrow-right" className="h-4 w-4" />
            </a>
          </div>
        </div>
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Почему спокойно"
          title="Берём на себя не только перевозку"
          subtitle="Считаем, упаковываем, несём, крепим и отвечаем за маршрут. Вы принимаете результат, а не координируете подрядчиков."
          accent="emerald"
        />
        <FeatureGrid
          accent="emerald"
          columns={3}
          items={[
            {
              icon: "dollar",
              title: "Цена до выезда",
              text: "Считаем машину, грузчиков и дополнительные работы заранее. Без «доплат на месте» за то, что уже обсудили.",
            },
            {
              icon: "truck",
              title: "Машина под объём",
              text: "Не предлагаем маленький фургон «на авось». Подбираем транспорт по количеству вещей и габаритам.",
            },
            {
              icon: "boxes",
              title: "Бережная упаковка",
              text: "Плёнка, коробки и защита для мебели и техники. Хрупкие вещи перевозим отдельно и аккуратно.",
            },
            {
              icon: "document",
              title: "Документы для бизнеса",
              text: "Для юрлиц — договор, счёт, акт и ТТН. Помогаем с отчётностью и согласованием времени.",
            },
            {
              icon: "route",
              title: "Понятный маршрут",
              text: "Заранее обсуждаем адреса, этажи, лифты и парковку. Предупреждаем, если что-то влияет на время.",
            },
            {
              icon: "phone",
              title: "Один диспетчер",
              text: "Ведёт заказ от расчёта до выгрузки. Сообщает, когда машина выехала, и решает вопросы в пути.",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Как проходит переезд"
          title="Пять шагов — и вещи на новом месте"
          subtitle="Чем точнее вы опишете объём и условия, тем меньше времени уйдёт на погрузку и тем точнее будет смета."
          accent="blue"
        />
        <Steps
          accent="blue"
          columns={5}
          items={[
            {
              title: "Заявка",
              text: "Адреса, этажи, лифт, примерный объём вещей и дата. Можно прислать фото комнат.",
              meta: "5–10 минут",
            },
            {
              title: "Расчёт",
              text: "Подбираем машину и бригаду, считаем время и стоимость. Согласуем условия до выезда.",
              meta: "до выезда",
            },
            {
              title: "Подготовка",
              text: "При необходимости упаковываем вещи, разбираем мебель и защищаем хрупкие предметы.",
              meta: "по задаче",
            },
            {
              title: "Погрузка и перевозка",
              text: "Аккуратно выносим, размещаем и крепим груз. Едем по согласованному маршруту.",
              meta: "по маршруту",
            },
            {
              title: "Разгрузка и расстановка",
              text: "Заносим, поднимаем на этаж и ставим мебель туда, где удобно. Собираем разобранное.",
              meta: "на месте",
            },
          ]}
        />
      </LandingSection>

      <LandingSection>
        <SectionHeading
          badge="Цены"
          title="Ориентиры по стоимости"
          subtitle="Ниже — базовые тарифы и типовые пакеты. Точная сумма зависит от адресов, этажности, лифта, объёма и времени."
          accent="amber"
        />
        <PriceGrid
          accent="amber"
          items={[
            {
              title: "Грузовое такси, фургон до 1,5 т",
              price: "от 40 BYN",
              unit: "за час",
              note: "10–12 м³, машина с водителем. Минимум 2 часа.",
            },
            {
              title: "Фургон до 3 т",
              price: "от 50 BYN",
              unit: "за час",
              note: "20–25 м³. Для квартиры, небольшого офиса или паллет.",
            },
            {
              title: "Фургон до 5 т",
              price: "от 60 BYN",
              unit: "за час",
              note: "35–40 м³. Для большой квартиры, дома или склада.",
            },
            {
              title: "Грузчик",
              price: "от 25 BYN",
              unit: "за час",
              note: "За человека. Минимальный заказ — 2 часа.",
            },
            {
              title: "Машина + 2 грузчика",
              price: "от 90 BYN",
              unit: "за час",
              note: "Квартирный переезд в пределах Минска.",
              badge: "часто",
            },
            {
              title: "Офисный переезд",
              price: "от 120 BYN",
              unit: "за час",
              note: "Машина и бригада. С учётом пропускного режима и лифтов.",
              badge: "для бизнеса",
            },
            {
              title: "1-комнатная квартира",
              price: "от 180 BYN",
              note: "Ориентир: машина + 2 грузчика, 2–3 часа.",
              badge: "пакет",
            },
            {
              title: "2–3-комнатная квартира",
              price: "от 270 BYN",
              note: "Ориентир: 3–4 часа, без стоимости упаковки.",
              badge: "популярно",
            },
            {
              title: "За МКАД",
              price: "от 1,30 BYN",
              unit: "за км",
              note: "Километраж и время работы машины.",
            },
            {
              title: "Межгород по Беларуси",
              price: "от 1,30 BYN",
              unit: "за км",
              note: "Минск — областные центры и обратно. Для юрлиц — ТТН.",
            },
            {
              title: "Упаковка вещей",
              price: "от 3 BYN",
              unit: "за единицу",
              note: "Плёнка, коробки и защита хрупких вещей.",
            },
            {
              title: "Разборка / сборка мебели",
              price: "от 30 BYN",
              unit: "за единицу",
              note: "Шкафы, кровати, стенки и другая корпусная мебель.",
            },
          ]}
          note="Цены указаны как ориентир и не являются публичной офертой. Минимальный заказ — 2 часа. Итоговая смета зависит от адресов, этажности, лифта, объёма, времени и дополнительных работ. Стоимость фиксируем до выезда."
        />
      </LandingSection>

      <CtaBand
        title="Сколько будет стоить ваш переезд?"
        text="Опишите адреса, этажи и объём вещей — подберём машину и бригаду, назовём цену. Для бизнеса подготовим счёт и документы."
        primaryLabel="Получить расчёт"
        phone={phone}
        accent="amber"
      />

      <LandingSection>
        <SectionHeading
          badge="Частые вопросы"
          title="Что важно знать до заказа"
          accent="amber"
        />
        <Faq items={faq} accent="amber" />
      </LandingSection>

      <LandingSection className="pt-0">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Подготовка
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Что поможет посчитать точнее</h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-400">
              {[
                "Адреса погрузки и разгрузки, этажи и наличие лифта.",
                "Примерный объём: комнаты, крупная мебель, техника, коробки.",
                "Дата и удобное время, нужна ли упаковка или разборка мебели.",
                "Для юрлица — реквизиты и требования к закрывающим документам.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {phone && (
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-950/60 px-5 text-sm font-medium text-white transition hover:border-zinc-500"
              >
                <LandingIcon name="phone" className="h-4 w-4 text-amber-400" />
                {phone}
              </a>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-600">
              Можно прислать фото комнат и крупных предметов — так расчёт будет точнее, а на месте
              не придётся пересчитывать время.
            </p>
          </div>

          <LandingLeadForm
            topic="Грузоперевозки"
            serviceSlug="moving"
            title="Рассчитать переезд"
            description="Оставьте контакты — уточним адреса, объём и время, затем назовём стоимость."
            commentPlaceholder="Адреса, этажи, лифт, объём вещей, дата переезда"
            submitLabel="Получить расчёт"
            accent="amber"
            phone={phone}
          />
        </div>
      </LandingSection>

      <StickyCta phone={phone} formLabel="Расчёт" />
    </div>
  );
}
