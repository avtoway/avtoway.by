import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import { getServiceLandingMetadata } from "@/features/service-landings/lib/metadata";
import LandingPageView from "@/features/service-landings/ui/landing-page-view";

export const revalidate = 300;

export function generateMetadata() {
  return getServiceLandingMetadata("service");
}

export default async function AutoServiceLandingPage() {
  const { contact, landing } = await getServiceLandingContext("service");
  return <LandingPageView slug="service" content={landing.content} phone={contact?.phone ?? null} />;
}
