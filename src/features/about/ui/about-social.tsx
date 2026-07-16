"use client";

import { useState } from "react";
import Reveal from "@/shared/ui/reveal";
import AnimatedSection from "@/shared/ui/animated-section";
import { SOCIAL_LINKS } from "@/shared/config/social";
import { IconInstagram, IconRutube, IconVK, IconYouTube } from "@/shared/ui/icons";

const sectionColor = "rgba(16,185,129,0.10)";

function SocialIcon({ icon, className }: { icon: string; className?: string }) {
  switch (icon) {
    case "youtube":
      return <IconYouTube className={className} />;
    case "instagram":
      return <IconInstagram className={className} />;
    case "rutube":
      return <IconRutube className={className} />;
    case "vk":
      return <IconVK className={className} />;
    default:
      return null;
  }
}

export default function AboutSocial() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <AnimatedSection
      color="#10b981" topOffset={0}
      className="py-24"
      style={{
        background: "linear-gradient(-45deg, rgba(16,185,129,0.05), rgba(59,130,246,0.03), rgba(16,185,129,0.05))",
        backgroundSize: "400% 400%",
      }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/3 -top-6 h-10 w-10 rounded-xl border border-green/20 bg-green/5"
          style={{ animation: "float-shape 14s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-8 bottom-10 h-16 w-16 rounded-full border border-accent2/20 bg-accent2/5"
          style={{ animation: "float-shape 18s ease-in-out -3s infinite" }}
        />
        <div
          className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-green/5 to-transparent"
          style={{ animation: "beam-sweep 5.5s ease-in-out infinite" }}
        />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${sectionColor}, transparent 70%)`, animation: "gradient-shift 9s ease-in-out infinite" }} />
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: hoveredSocial ? `radial-gradient(ellipse 60% 50% at 50% 50%, ${hoveredSocial}15 0%, transparent 60%)` : "none",
            opacity: hoveredSocial ? 1 : 0,
          }}
        />
      </div>
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <h2 className="mb-8 text-3xl font-bold text-white">Мои ресурсы</h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="mb-12 text-zinc-400">
            Следите за проектами и развитием бренда в социальных сетях
          </p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-4">
          {SOCIAL_LINKS.map((s, i) => (
            <Reveal key={s.label} delay={200 + i * 80}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredSocial(s.color)}
                onMouseLeave={() => setHoveredSocial(null)}
                className={`inline-flex h-12 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900 px-6 text-sm font-medium text-zinc-400 shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.border} ${s.text} ${s.shadow}`}
              >
                <SocialIcon icon={s.icon} className="size-4" />
                {s.label}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
