import type { Metadata } from "next";

const BASE_URL = "https://avtoway.by";

interface PageMeta {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export function buildMetadata(page: PageMeta): Metadata {
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${BASE_URL}${page.url}`,
      siteName: "АВТОWAY",
      locale: "ru_RU",
      type: "website",
      images: page.image ? [{ url: page.image }] : undefined,
    },
    alternates: { canonical: `${BASE_URL}${page.url}` },
  };
}
