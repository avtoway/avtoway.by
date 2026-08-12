import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function OrganizationSchema() {
  const db = getPrismaClient();
  const contact = await db.contact.findFirst();
  const sameAs: string[] = [];
  if (contact?.youtube) sameAs.push(contact.youtube);
  if (contact?.instagram) sameAs.push(contact.instagram);
  if (contact?.rutube) sameAs.push(contact.rutube);
  if (contact?.vk) sameAs.push(contact.vk);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "АВТОWAY",
    url: "https://avtoway.by",
    logo: "https://avtoway.by/images/avatar.webp",
    description: "Личный бренд и проекты про автомобили. Честные обзоры, ремонты, лайфхаки и полезные услуги.",
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
    url: `https://avtoway.by${url}`,
    provider: { "@type": "Organization", name: "АВТОWAY" },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
