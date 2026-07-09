"use client";

import { useState, useEffect } from "react";

const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

interface Particle {
  left: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

export default function Particles({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 2.5,
      duration: 20 + Math.random() * 30,
      delay: Math.random() * 20,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setParticles(items);
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            bottom: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            opacity: 0,
            animation: `particle-rise ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
