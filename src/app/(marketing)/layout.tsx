import SiteHeader from "@/shared/ui/site-header";
import SiteFooter from "@/shared/ui/site-footer";
import AdSlotBlock from "@/features/ads/ui/ad-slot";
import AnalyticsScripts from "@/features/analytics/ui/analytics-scripts";
import CookieConsent from "@/features/analytics/ui/cookie-consent";
import { getAnalyticsSettings } from "@/features/analytics/lib/get-settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAnalyticsSettings();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Перейти к содержимому
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <AdSlotBlock slotKey="global_footer" />
      <SiteFooter />
      <CookieConsent />
      {settings && (
        <AnalyticsScripts
          gaId={settings.gaId}
          ymId={settings.ymId}
          ymWebvisor={settings.ymWebvisor}
        />
      )}
    </>
  );
}
