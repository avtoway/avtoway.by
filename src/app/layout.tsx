import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/di/composition-root";
import { SITE_URL } from "@/shared/config/site";
import { OrganizationSchema } from "@/shared/ui/json-ld";
import { getAnalyticsSettings } from "@/features/analytics/lib/get-settings";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getAnalyticsSettings();
  const defaultTitle = settings?.seoTitle?.trim() || "АВТОWAY — автомобильные услуги в Минске";
  const defaultDescription =
    settings?.seoDescription?.trim() ||
    "АВТОWAY — аренда авто, автоподбор, эвакуатор, автопригон, автосервис и грузоперевозки в Минске.";
  const noindex = settings?.noindex ?? false;

  const verification: Metadata["verification"] = {};
  if (settings?.googleVerification) verification.google = settings.googleVerification;
  if (settings?.yandexVerification) verification.yandex = settings.yandexVerification;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | АВТОWAY`,
    },
    description: defaultDescription,
    alternates: {
      canonical: "/",
      languages: { ru: "/" },
    },
    robots: {
      index: !noindex,
      follow: !noindex,
    },
    verification,
    openGraph: {
      title: settings?.seoTitle?.trim() || "АВТОWAY",
      description: defaultDescription,
      siteName: "АВТОWAY",
      url: "/",
      locale: "ru_RU",
      type: "website",
      images: settings?.ogImage ? [{ url: settings.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seoTitle?.trim() || "АВТОWAY",
      description: defaultDescription,
      images: settings?.ogImage ? [settings.ogImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
    >
      <head>
        {/* Если JS доступен, включаем анимации reveal. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.classList.add("js")',
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col bg-background font-sans text-foreground antialiased">
        <OrganizationSchema />
        {children}
      </body>
    </html>
  );
}
