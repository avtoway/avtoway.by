"use client";

import { useState } from "react";

export default function HeroBackground({ videoId }: { videoId: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&playsinline=1&modestbranding=1&disablekb=1&fs=0`}
          allow="autoplay; encrypted-media"
          className={`h-[120%] w-[120%] -left-[10%] -top-[10%] absolute scale-150 transition-opacity duration-1000 ${loaded ? "opacity-30" : "opacity-0"}`}
          style={{ pointerEvents: "none" }}
          onLoad={() => setLoaded(true)}
        />
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
