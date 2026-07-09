"use client";

import ScrollProgress from "@/components/scroll-progress";
import SiteLogo from "@/components/site-logo";
import MainNav from "@/components/main-nav";

export default function SiteHeader() {
  return (
    <>
      <ScrollProgress />
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <SiteLogo />
          <MainNav />
        </div>
      </header>
    </>
  );
}
