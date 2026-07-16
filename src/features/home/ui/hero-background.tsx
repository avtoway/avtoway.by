"use client";

import { useState, useRef, useEffect } from "react";

export default function HeroBackground() {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onCanPlay = () => setLoaded(true);
    const onError = () => setLoaded(true);
    vid.addEventListener("canplay", onCanPlay);
    vid.addEventListener("error", onError);
    if (vid.readyState >= 3) setLoaded(true);
    return () => {
      vid.removeEventListener("canplay", onCanPlay);
      vid.removeEventListener("error", onError);
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/hero-poster.jpg"
          className={`h-full w-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-30" : "opacity-0"}`}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-10" />
      </div>

      <div
        className={`animate-gradient absolute -inset-24 scale-150 transition-opacity duration-1000 ${loaded ? "opacity-0" : "opacity-[0.06]"}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#ef4444_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,#3b82f6_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,#f59e0b_0%,transparent_40%)]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#ef4444_0%,_transparent_60%)] opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_black_0%,_transparent_60%)] opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
    </>
  );
}
