import SiteHeader from "@/shared/ui/site-header";
import SiteFooter from "@/shared/ui/site-footer";
import AnalyticsScripts from "@/features/analytics/ui/analytics-scripts";
import { getAnalyticsSettings } from "@/features/analytics/lib/get-settings";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAnalyticsSettings();

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
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
