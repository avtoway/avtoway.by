import type { AutoPodborPublicData } from "@/entities/autopodbor/autopodbor.types";

const BASE = "https://avtoway.by";

function serialize(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export default function AutoPodborStructuredData({ data }: { data: AutoPodborPublicData }) {
  const { settings, tariffs, faq, cities } = data;

  const offers = tariffs
    .filter(tariff => tariff.price != null)
    .map(tariff => ({
      "@type": "Offer",
      name: tariff.title,
      price: tariff.price,
      priceCurrency: tariff.currency || "BYN",
      url: `${BASE}/services/inspection`,
      availability: "https://schema.org/InStock",
    }));

  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Автоподбор и проверка авто перед покупкой",
    serviceType: "Автоподбор, разовый осмотр, эксперт на день",
    description:
      settings.seoDescription ||
      "Автоподбор под ключ, разовый осмотр и эксперт на день. Проверяем кузов, двигатель, пробег и документы, торгуемся за вас.",
    url: `${BASE}/services/inspection`,
    provider: {
      "@type": "Organization",
      name: "АВТОWAY",
      url: BASE,
      ...(settings.phone ? { telephone: settings.phone } : {}),
    },
    ...(cities.length > 0 ? { areaServed: cities.map(city => city.name) } : {}),
    ...(offers.length > 0 ? { offers } : {}),
  };

  const faqPage = faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Главная", item: BASE },
      { "@type": "ListItem", position: 2, name: "Услуги", item: `${BASE}/services` },
      { "@type": "ListItem", position: 3, name: "Автоподбор", item: `${BASE}/services/inspection` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(service) }} />
      {faqPage && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(faqPage) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(breadcrumbs) }} />
    </>
  );
}
