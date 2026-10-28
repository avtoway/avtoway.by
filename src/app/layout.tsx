import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/di/composition-root";
import { SITE_URL } from "@/shared/config/site";
import { OrganizationSchema } from "@/shared/ui/json-ld";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "АВТОWAY — Автомобильные движения",
    template: "%s | АВТОWAY",
  },
  description:
    "АВТОWAY — всё об автомобилях: обзоры, тест-драйвы, услуги и аренда авто.",
  alternates: {
    canonical: "/",
    languages: { ru: "/" },
  },
  openGraph: {
    title: "АВТОWAY",
    description: "Автомобильные видео, услуги и аренда авто.",
    siteName: "АВТОWAY",
    url: "/",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "АВТОWAY",
    description: "Автомобильные видео, услуги и аренда авто.",
  },
};

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
        {/* Без JS контент остаётся видимым: класс js включает анимацию Reveal. */}
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
