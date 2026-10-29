import Image from "next/image";
import Link from "next/link";
import type { Partner } from "@/entities/partner/partner";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function parseLines(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function PublicPartnerCard({ partner }: { partner: Partner }) {
  const photo = partner.photo ?? partner.photos?.[0];
  const description = partner.shortDescription || partner.description;
  const services = parseLines(partner.services).slice(0, 3);

  return (
    <Link
      href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
      className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70 sm:flex-row"
    >
      <div className="relative h-56 shrink-0 overflow-hidden bg-zinc-900 sm:h-auto sm:w-[40%] sm:self-stretch">
        {photo ? (
          <Image
            src={photo}
            alt={partner.name}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.14),transparent_55%),linear-gradient(135deg,#18181b,#09090b)]">
            <span className="text-4xl font-black tracking-wider text-white/20">{initials(partner.name)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-zinc-950/30" />
        {partner.address && (
          <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            {partner.address}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-300">
            Партнёр АВТОWAY
          </span>
          {partner.workingHours && (
            <span className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 normal-case tracking-normal text-zinc-400">
              {partner.workingHours}
            </span>
          )}
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-red-300">
          {partner.name}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
        )}

        {services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {services.map((service) => (
              <span key={service} className="rounded-full border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[10px] text-zinc-500">
                {service}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-zinc-800/70 pt-5">
          <span className="text-sm font-medium text-zinc-400 transition-colors group-hover:text-white">
            Подробнее о партнёре
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-500 transition-all group-hover:border-red-500/40 group-hover:text-red-300">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
