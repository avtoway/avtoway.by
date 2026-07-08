"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  lineTop?: string;
}

export default function AnimatedSection({ children, color, className, style, lineTop = "top-0" }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${className || ""}`}
      style={style}
    >
      {children}

      <div
        className={`pointer-events-none absolute left-0 right-0 ${lineTop} h-[2px] transition-all duration-700 ease-out`}
        style={{
          background: `linear-gradient(to right, transparent, ${color} 15%, ${color} 85%, transparent)`,
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "center",
          opacity: visible ? 1 : 0,
          boxShadow: visible ? `0 0 18px ${color}60, 0 0 60px ${color}30` : "none",
        }}
      />
    </section>
  );
}
