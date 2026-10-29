import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import { getServiceLandingMetadata } from "@/features/service-landings/lib/metadata";
import LandingPageView from "@/features/service-landings/ui/landing-page-view";

export const revalidate = 300;

export function generateMetadata() {
  return getServiceLandingMetadata("truck");
}

export default async function EvacuationLandingPage() {
  const { contact, landing } = await getServiceLandingContext("truck");
  return <LandingPageView slug="truck" content={landing.content} phone={contact?.phone ?? null} />;
}
