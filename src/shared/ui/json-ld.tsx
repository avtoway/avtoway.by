import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { SITE_URL } from "@/shared/config/site";
import { telegramUrl } from "@/shared/lib/social";

/** JSON-LD безопасно встраивается в <script>: экранируем `<`, чтобы нельзя было закрыть тег. */
function serialize(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export async function OrganizationSchema() {
  const db = getPrismaClient();
  const contact = await db.contact.findFirst();
  const sameAs: string[] = [];
  const telegram = contact?.telegram ? telegramUrl(contact.telegram) : null;
  if (telegram) sameAs.push(telegram);
  if (contact?.youtube) sameAs.push(contact.youtube);
  if (contact?.instagram) sameAs.push(contact.instagram);
  if (contact?.rutube) sameAs.push(contact.rutube);
  if (contact?.vk) sameAs.push(contact.vk);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "АВТОWAY",
    url: SITE_URL,
    logo: `${SITE_URL}/images/avatar.webp`,
    description: "Личный бренд и проекты про автомобили. Честные обзоры, ремонты, лайфхаки и полезные услуги.",
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}

interface ServiceSchemaProps {
  name: string;
  description: string;
  url: string;
}

export function ServiceSchema({ name, description, url }: ServiceSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${SITE_URL}${url}`,
    provider: { "@type": "Organization", name: "АВТОWAY" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}

interface JobPostingSchemaProps {
  title: string;
  description: string;
  datePosted: string;
  employmentType?: string;
  location?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  url: string;
}

export function JobPostingSchema({
  title,
  description,
  datePosted,
  employmentType,
  location = "Минск",
  salaryFrom,
  salaryTo,
  salaryCurrency = "BYN",
  salaryPeriod = "month",
  url,
}: JobPostingSchemaProps) {
  const employmentMap: Record<string, string> = {
    full_time: "FULL_TIME",
    part_time: "PART_TIME",
    contract: "CONTRACTOR",
    temporary: "TEMPORARY",
    internship: "INTERN",
  };
  const periodMap: Record<string, string> = {
    month: "MONTH",
    hour: "HOUR",
  };

  const salary =
    salaryFrom || salaryTo
      ? {
          "@type": "MonetaryAmount",
          currency: salaryCurrency,
          value: {
            "@type": "QuantitativeValue",
            ...(salaryFrom ? { minValue: salaryFrom } : {}),
            ...(salaryTo ? { maxValue: salaryTo } : {}),
            ...(periodMap[salaryPeriod] ? { unitText: periodMap[salaryPeriod] } : {}),
          },
        }
      : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted,
    employmentType: employmentMap[employmentType ?? ""] ?? "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "АВТОWAY",
      sameAs: SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: location,
        addressCountry: "BY",
      },
    },
    url: `${SITE_URL}${url}`,
    ...(salary ? { baseSalary: salary } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}

interface FaqSchemaProps {
  items: Array<{ question: string; answer: string }>;
}

export function FaqSchema({ items }: FaqSchemaProps) {
  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}
