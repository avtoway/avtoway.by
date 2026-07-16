"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "@/shared/lib/hooks/use-in-view";

interface Props {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

export default function AnimatedCounter({ value, label, suffix = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.3 });
  const [displayed, setDisplayed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView || done) return;
    const timeout = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      let raf: number;
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - (1 - progress) * (1 - progress);
        setDisplayed(Math.floor(eased * value));
        if (progress < 1) {
          raf = requestAnimationFrame(animate);
        } else {
          setDisplayed(value);
          setDone(true);
        }
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, delay);
    return () => clearTimeout(timeout);
  }, [inView, value, delay, done]);

  return (
    <div ref={ref} className={`text-center ${inView ? "animate-counter" : "opacity-0"}`} style={{ animationDelay: `${delay}ms` }}>
      <div className="text-4xl font-extrabold text-white tabular-nums tracking-tight">
        {displayed}{suffix}
      </div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
    </div>
  );
}
