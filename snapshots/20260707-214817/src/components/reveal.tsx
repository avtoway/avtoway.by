"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "@/lib/use-in-view";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={`animate-reveal ${inView ? "revealed" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
