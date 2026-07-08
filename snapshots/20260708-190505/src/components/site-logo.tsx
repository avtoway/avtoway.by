"use client";

import Link from "next/link";

export default function SiteLogo() {
  return (
    <Link
      href="/"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="animate-logo text-3xl font-extrabold tracking-wider text-zinc-100 transition-all duration-300 hover:scale-105"
    >
      АВТО
      <span className="tracking-[0.15em] font-black text-zinc-300 transition-all duration-300 hover:tracking-[0.2em]">
        WAY
      </span>
    </Link>
  );
}
