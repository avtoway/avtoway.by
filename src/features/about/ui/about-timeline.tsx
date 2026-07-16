"use client";

import { useRef } from "react";
import Reveal from "@/shared/ui/reveal";
import AnimatedSection from "@/shared/ui/animated-section";
import { MILESTONES } from "@/shared/config/milestones";
import { useInView } from "@/shared/lib/hooks/use-in-view";

const sectionColor = "rgba(245,158,11,0.10)";

export default function AboutTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, { threshold: 0.1 });

  return (
    <AnimatedSection
      color="#f59e0b" topOffset={0}
      className="py-24"
      style={{
        background: "linear-gradient(-45deg, rgba(245,158,11,0.05), rgba(239,68,68,0.03), rgba(245,158,11,0.05))",
        backgroundSize: "400% 400%",
      }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-10 top-10 h-12 w-12 rounded-full border border-accent/20 bg-accent/5"
          style={{ animation: "float-shape 17s ease-in-out infinite" }}
        />
        <div
          className="absolute -left-6 bottom-1/4 h-14 w-14 rotate-45 border border-primary/20 bg-primary/5"
          style={{ animation: "float-shape 13s ease-in-out -7s infinite" }}
        />
        <div
          className="absolute h-full w-1/3 bg-gradient-to-r from-transparent via-accent/5 to-transparent"
          style={{ animation: "beam-sweep 7s ease-in-out infinite" }}
        />
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${sectionColor}, transparent 70%)`, animation: "gradient-shift 12s ease-in-out infinite" }} />
      </div>
      <div className="relative mx-auto max-w-4xl px-6">
        <Reveal>
          <h2 className="mb-16 text-3xl font-bold text-white">История</h2>
        </Reveal>
        <div ref={timelineRef} className="relative">
          <div
            className="absolute left-[19px] top-3 w-px bg-gradient-to-b from-[#f59e0b]/50 via-zinc-700 via-60% to-transparent"
            style={{
              height: "calc(100% + 48px)",
              clipPath: timelineInView ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
              transition: "clip-path 1.2s ease-out",
            }}
          />
          {MILESTONES.map((m, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="group relative flex gap-8 pb-14 last:pb-0">
                <div
                  className={`absolute -left-[13px] top-4 z-10 flex items-center justify-center rounded-full border-2 bg-zinc-900 text-[10px] font-bold shadow-lg shadow-black/20 transition-all duration-300 group-hover:scale-125 group-hover:border-[#f59e0b] group-hover:text-[#f59e0b] group-hover:shadow-lg group-hover:shadow-[#f59e0b]/20 ${
                    i === MILESTONES.length - 1
                      ? "h-[30px] w-[30px] border-[#f59e0b] text-[#f59e0b] shadow-[#f59e0b]/30 animate-pulse"
                      : "h-[26px] w-[26px] border-zinc-700 text-zinc-500"
                  }`}
                >
                  {m.year.slice(2)}
                </div>
                <div className="ml-12 pt-1 transition-all duration-300 group-hover:translate-x-1.5">
                  <span className="mb-1 block text-xs font-medium tracking-wider uppercase transition-colors duration-300 text-zinc-600 group-hover:text-[#f59e0b]">
                    {m.year}{i === MILESTONES.length - 1 ? " — сейчас" : ""}
                  </span>
                  <h3 className="mb-2 text-base font-semibold transition-colors duration-300 text-zinc-300 group-hover:text-white">
                    {m.title}
                  </h3>
                  <p className="text-sm leading-relaxed transition-colors duration-300 text-zinc-500 group-hover:text-zinc-300">
                    {m.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}

          <div className="relative h-14">
            <div className="absolute -left-[13px] flex h-[26px] w-[26px] items-center justify-center">
              <span className="absolute h-4 w-4 animate-ping rounded-full bg-[#f59e0b]/40" />
              <span className="absolute h-6 w-6 animate-ping rounded-full bg-[#f59e0b]/20" style={{ animationDelay: "0.5s" }} />
              <span className="absolute h-8 w-8 animate-ping rounded-full bg-[#f59e0b]/10" style={{ animationDelay: "1s" }} />
              <span className="absolute h-3 w-3 animate-pulse rounded-full bg-[#f59e0b]" />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
