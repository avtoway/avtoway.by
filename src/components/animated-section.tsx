"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  color: string;
  className?: string;
  style?: React.CSSProperties;
  topOffset?: number; // px from top of section

export default function AnimatedSection({ children, color, className, style, topOffset = 0 }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [flash, setFlash] = useState(false);

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

  useEffect(() => {
    if (!visible) return;
    const raf = requestAnimationFrame(() => {
      setFlash(true);
    });
    const timer = setTimeout(() => setFlash(false), 800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [visible]);

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
          transform: visible ? "scaleX(1)" : "scaleX(0)",
          transformOrigin: "center",
          opacity: visible ? 0.5 : 0,
          boxShadow: flash ? `0 0 30px ${color}70, 0 0 80px ${color}30` : "none",
          transition: "transform 0.7s ease-out, opacity 0.7s ease-out, box-shadow 0.4s ease-out",
        }}
      />
    </section>
  );
}
