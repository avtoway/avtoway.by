export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "АВТОWAY",
    url: "https://avtoway.by",
    logo: "https://avtoway.by/images/avatar.webp",
    description: "Личный бренд и проекты про автомобили. Честные обзоры, ремонты, лайфхаки и полезные услуги.",
    sameAs: [
      "https://youtube.com/@avtoway",
      "https://www.instagram.com/avtoway_by/",
      "https://rutube.ru/channel/32699183/",
      "https://vk.com/video/@avtoway_channel",
    ],
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
