const COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

export default function Particles({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    left: ((i * 17 + 3) % 100),
    size: 1.5 + ((i * 7 + 11) % 5) * 0.5,
    duration: 20 + ((i * 13) % 30),
    delay: (i * 5) % 20,
    color: COLORS[i % COLORS.length],
  }));

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
