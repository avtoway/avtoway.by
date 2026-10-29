import { getServiceLandingContext } from "@/features/service-landings/lib/get-context";
import { getServiceLandingMetadata } from "@/features/service-landings/lib/metadata";
import LandingPageView from "@/features/service-landings/ui/landing-page-view";

export const revalidate = 300;

export function generateMetadata() {
  return getServiceLandingMetadata("moving");
}

export default async function MovingLandingPage() {
  const { contact, landing } = await getServiceLandingContext("moving");
  return <LandingPageView slug="moving" content={landing.content} phone={contact?.phone ?? null} />;
}
