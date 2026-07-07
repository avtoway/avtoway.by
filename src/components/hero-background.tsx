"use client";

import { useState } from "react";

export default function HeroBackground() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          onCanPlay={() => setLoaded(true)}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {!loaded && (
        <div className="animate-gradient absolute -inset-24 scale-150 opacity-[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#ef4444_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,#3b82f6_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#f59e0b_0%,transparent_40%)]" />
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ef4444_0%,_transparent_60%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_black_0%,_transparent_60%)] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
    </>
  );
}
