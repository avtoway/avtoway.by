"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import { useInView } from "@/shared/lib/hooks/use-in-view";

interface Props {
  children: ReactNode;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  topOffset?: number;
}

export default function AnimatedSection({ children, color, className, style, topOffset = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const raf = requestAnimationFrame(() => setFlash(true));
    const timer = setTimeout(() => setFlash(false), 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${className || ""}`}
      style={style}
    >
      {children}

      <div
        className="pointer-events-none absolute left-0 right-0 h-[2px]"
        style={{
          top: topOffset,
          background: `linear-gradient(to right, transparent, ${color} 15%, ${color} 85%, transparent)`,
          transform: inView ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "center",
          opacity: inView ? 0.5 : 0,
          boxShadow: flash ? `0 0 30px ${color}70, 0 0 80px ${color}30` : "none",
          transition: "transform 0.7s ease-out, opacity 0.7s ease-out, box-shadow 0.4s ease-out",
        }}
      />
    </section>
  );
}
