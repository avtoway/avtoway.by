import Image from "next/image";
import type { Partner } from "@/entities/partner/partner";
import { telegramUrl } from "@/shared/lib/social";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function websiteLabel(value: string): string {
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function normalizeWebsite(value: string): string {
  return value.startsWith("http") ? value : `https://${value}`;
}

export default function PublicPartnerCard({ partner }: { partner: Partner }) {
  const photo = partner.photo ?? partner.photos?.[0];
  const telegram = telegramUrl(partner.telegram);
  const website = partner.website ? normalizeWebsite(partner.website) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/40 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700 hover:bg-zinc-900/70">
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900">
        {photo ? (
          <Image
            src={photo}
            alt={partner.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.14),transparent_55%),linear-gradient(135deg,#18181b,#09090b)]">
            <span className="text-4xl font-black tracking-wider text-white/20">{initials(partner.name)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent" />
        {partner.contactPerson && (
          <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
            {partner.contactPerson}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-xl font-bold text-white transition-colors group-hover:text-red-400">{partner.name}</h2>
        {partner.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-500">{partner.description}</p>
        )}

        {(partner.phone || partner.email || partner.address) && (
          <div className="mt-4 space-y-1.5 text-xs text-zinc-500">
            {partner.phone && (
              <a href={`tel:${partner.phone.replace(/[^\d+]/g, "")}`} className="block transition hover:text-white">
                {partner.phone}
              </a>
            )}
            {partner.email && (
              <a href={`mailto:${partner.email}`} className="block truncate transition hover:text-white">
                {partner.email}
              </a>
            )}
            {partner.address && <p>{partner.address}</p>}
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white"
            >
              {websiteLabel(website)} ↗
            </a>
          )}
          {telegram && (
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[11px] font-medium text-sky-300 transition hover:border-sky-500/40"
            >
              Telegram
            </a>
          )}
          {partner.instagram && (
            <a
              href={partner.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[11px] font-medium text-pink-300 transition hover:border-pink-500/40"
            >
              Instagram
            </a>
          )}
          {partner.vk && (
            <a
              href={partner.vk}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-medium text-blue-300 transition hover:border-blue-500/40"
            >
              VK
            </a>
          )}
          {partner.youtube && (
            <a
              href={partner.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-medium text-red-300 transition hover:border-red-500/40"
            >
              YouTube
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
