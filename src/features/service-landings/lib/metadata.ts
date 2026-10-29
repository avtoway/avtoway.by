import type { Metadata } from "next";
import { getServiceLandingContext } from "./get-context";

export async function getServiceLandingMetadata(slug: string): Promise<Metadata> {
  const { landing } = await getServiceLandingContext(slug);
  const title = landing.seoTitle;
  const description = landing.seoDescription;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/services/${slug}` },
    openGraph: {
      title: landing.ogTitle ?? title,
      description: landing.ogDescription ?? description,
      url: `/services/${slug}`,
      type: "website",
    },
  };
}
