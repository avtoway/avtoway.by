import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "АВТОWAY — Автомобильные движения",
    template: "%s | АВТОWAY",
  },
  description:
    "АВТОWAY — всё об автомобилях: обзоры, тест-драйвы, услуги и аренда авто.",
  openGraph: {
    title: "АВТОWAY",
    description: "Автомобильные видео, услуги и аренда авто.",
    siteName: "АВТОWAY",
    locale: "ru_RU",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
    >
      <body className="min-h-dvh flex flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
