"use client";

import { getServiceIcon } from "@/shared/config/icons-map";
import ServiceCard from "@/shared/ui/service-card";
import SectionWrapper from "@/shared/ui/section-wrapper";
import Carousel from "@/shared/ui/carousel";
import { useColorReveal } from "@/shared/lib/hooks/use-color-reveal";

const CARD_WIDTH = 340;
const GAP = 24;

interface ServiceItem {
  title: string;
  desc: string;
  href: string;
  color: string;
  iconName: string;
}

export default function ServicesCarousel({ items = [] }: { items?: ServiceItem[] }) {
  const { hoverColor, handleHover, handleLeave } = useColorReveal();
  const realLen = items.length;
  const isCarousel = realLen > 3;

  if (realLen === 0) return null;

  const rgb = hoverColor
    ? ((hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
      })(hoverColor)
    : null;

  return (
    <SectionWrapper id="services">
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: rgb
            ? `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(${rgb},0.15) 0%, transparent 70%)`
            : "none",
          opacity: rgb ? 1 : 0,
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-gradient rounded-full blur-[100px] transition-all duration-700"
          style={{
            background: rgb
              ? `radial-gradient(circle, rgba(${rgb},0.15), transparent 70%)`
              : "radial-gradient(circle, rgba(239,68,68,0.04), transparent 70%)",
            opacity: rgb ? 0.6 : 0.3,
          }}
        />
        <div
          className="absolute -bottom-40 right-20 h-[400px] w-[400px] animate-gradient rounded-full blur-[100px] transition-all duration-700"
          style={{
            animationDelay: "-7s",
            background: rgb
              ? `radial-gradient(circle, rgba(${rgb},0.15), transparent 70%)`
              : "radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)",
            opacity: rgb ? 0.6 : 0.3,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-gradient rounded-full blur-[80px] transition-all duration-700"
          style={{
            animationDelay: "-3.5s",
            background: rgb
              ? `radial-gradient(circle, rgba(${rgb},0.15), transparent 70%)`
              : "transparent",
            opacity: rgb ? 0.4 : 0,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center opacity-0 animate-reveal revealed">
          <h2 className="text-3xl font-bold text-white">
            Наши услуги
          </h2>
        </div>

        {!isCarousel ? (
          <div className="flex items-stretch justify-center gap-6 pt-3">
            {items.map((item) => {
              const Icon = getServiceIcon(item.iconName);
              return (
                <div key={item.title} className="flex-1 max-w-[340px]">
                  <ServiceCard
                    service={{ ...item, icon: <Icon /> }}
                    onHover={handleHover}
                    onLeave={handleLeave}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <Carousel
            items={items}
            cardWidth={CARD_WIDTH}
            gap={GAP}
            autoScroll={2500}
            renderItem={(item) => {
              const Icon = getServiceIcon(item.iconName);
              return (
                <ServiceCard
                  service={{ ...item, icon: <Icon /> }}
                  onHover={handleHover}
                  onLeave={handleLeave}
                />
              );
            }}
          />
        )}
      </div>
    </SectionWrapper>
  );
}
