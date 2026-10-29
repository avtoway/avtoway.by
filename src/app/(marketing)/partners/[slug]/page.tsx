import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { container } from "@/di/container";
import type { PartnerRepository } from "@/entities/partner/partner.repository";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import { LocalBusinessSchema } from "@/shared/ui/json-ld";
import { telegramUrl } from "@/shared/lib/social";
import LandingIcon from "@/features/service-landings/ui/icon";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

async function getPartner(slug: string) {
  const repo = container.get<PartnerRepository>("PartnerRepository");
  return repo.getBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const partner = await getPartner(slug);

  if (!partner || !partner.isActive) {
    return { title: "Партнёр не найден", robots: { index: false, follow: false } };
  }

  const description = partner.shortDescription || partner.description || "Партнёр АВТОWAY";

  return {
    title: { absolute: `${partner.name} — партнёр АВТОWAY` },
    description,
    alternates: { canonical: `/partners/${partner.slug}` },
    openGraph: {
      title: `${partner.name} | АВТОWAY`,
      description,
      url: `/partners/${partner.slug}`,
      type: "website",
      images: partner.photo ? [{ url: partner.photo, alt: partner.name }] : undefined,
    },
  };
}

function parseLines(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function uniquePhotos(photos?: string[]): string[] {
  return [...new Set((photos ?? []).filter(Boolean))];
}

function normalizeUrl(value?: string): string | null {
  if (!value) return null;
  return value.startsWith("http") ? value : `https://${value}`;
}

function websiteLabel(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function DetailList({
  badge,
  title,
  items,
  accent = "red",
}: {
  badge: string;
  title: string;
  items: string[];
  accent?: "red" | "emerald";
}) {
  if (items.length === 0) return null;

  const tones = {
    red: "border-red-500/20 bg-red-500/10 text-red-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  }[accent];

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-7">
      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones}`}>
        {badge}
      </span>
      <h2 className="mt-3 text-xl font-bold text-white">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-zinc-400">
            <span className="mt-0.5 text-primary">
              <LandingIcon name="check" className="h-4 w-4" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function PartnerPage({ params }: Props) {
  const { slug } = await params;
  const partner = await getPartner(slug);

  if (!partner || !partner.isActive) notFound();

  const photo = partner.photo ?? partner.photos?.[0];
  const gallery = uniquePhotos(partner.photos);
  const services = parseLines(partner.services);
  const advantages = parseLines(partner.advantages);
  const website = normalizeUrl(partner.website);
  const instagram = normalizeUrl(partner.instagram);
  const telegram = telegramUrl(partner.telegram);
  const vk = normalizeUrl(partner.vk);
  const youtube = normalizeUrl(partner.youtube);
  const phoneHref = partner.phone ? `tel:${partner.phone.replace(/[^\d+]/g, "")}` : null;

  const sameAs = [website, instagram, telegram, vk, youtube].filter(Boolean) as string[];
  const description = partner.description || partner.shortDescription || "Партнёр АВТОWAY";

  return (
    <div className="min-h-screen bg-zinc-950 pb-24 pt-28">
      <LocalBusinessSchema
        name={partner.name}
        description={description}
        url={`/partners/${partner.slug}`}
        image={photo}
        phone={partner.phone}
        address={partner.address}
        workingHours={partner.workingHours}
        sameAs={sameAs}
      />
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Партнёры", href: "/partners" },
          { label: partner.name },
        ]}
      />

      <div className="mx-auto max-w-6xl px-6">
        <PageBreadcrumbs
          className="mb-8"
          items={[
            { label: "Главная", href: "/" },
            { label: "Партнёры", href: "/partners" },
            { label: partner.name },
          ]}
        />

        <header className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-950">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-6 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                Партнёр АВТОWAY
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {partner.name}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                {partner.shortDescription || description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs text-zinc-400">
                {partner.address && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                    <LandingIcon name="map-pin" className="h-4 w-4 text-zinc-600" />
                    {partner.address}
                  </span>
                )}
                {partner.workingHours && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/60 px-3 py-1.5">
                    <LandingIcon name="clock" className="h-4 w-4 text-zinc-600" />
                    {partner.workingHours}
                  </span>
                )}
              </div>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary-dark"
                  >
                    {websiteLabel(website)}
                    <LandingIcon name="arrow-right" className="h-4 w-4" />
                  </a>
                )}
                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/60 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    <LandingIcon name="phone" className="h-4 w-4" />
                    {partner.phone}
                  </a>
                )}
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-pink-500/20 bg-pink-500/10 px-5 text-sm font-medium text-pink-300 transition hover:border-pink-500/40"
                  >
                    Instagram
                  </a>
                )}
                {telegram && (
                  <a
                    href={telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-sky-500/20 bg-sky-500/10 px-5 text-sm font-medium text-sky-300 transition hover:border-sky-500/40"
                  >
                    Telegram
                  </a>
                )}
              </div>
            </div>

            <div className="relative min-h-[300px] lg:min-h-[480px]">
              {photo ? (
                <Image
                  src={photo}
                  alt={partner.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full min-h-[300px] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.14),transparent_55%),linear-gradient(135deg,#18181b,#09090b)]">
                  <span className="text-6xl font-black tracking-wider text-white/20">
                    {partner.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-zinc-950/50 lg:to-transparent" />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="space-y-5">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">О партнёре</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </section>

            <DetailList badge="Услуги" title="Чем может помочь партнёр" items={services} accent="red" />
            <DetailList badge="Почему мы рекомендуем" title="Сильные стороны" items={advantages} accent="emerald" />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Контакты</p>
              <div className="mt-4 space-y-3 text-sm">
                {partner.contactPerson && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">Контакт</span>
                    <span className="text-right text-zinc-300">{partner.contactPerson}</span>
                  </div>
                )}
                {partner.address && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">Адрес</span>
                    <span className="text-right text-zinc-300">{partner.address}</span>
                  </div>
                )}
                {partner.workingHours && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">График</span>
                    <span className="text-right text-zinc-300">{partner.workingHours}</span>
                  </div>
                )}
                {partner.phone && (
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-800/70 pb-3">
                    <span className="text-zinc-500">Телефон</span>
                    <a href={phoneHref ?? "#"} className="text-right text-zinc-300 hover:text-white">{partner.phone}</a>
                  </div>
                )}
                {partner.email && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-zinc-500">Email</span>
                    <a href={`mailto:${partner.email}`} className="break-all text-right text-zinc-300 hover:text-white">{partner.email}</a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {website && <a href={website} target="_blank" rel="noopener noreferrer" className="rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-1.5 text-[11px] text-zinc-400 transition hover:border-zinc-500 hover:text-white">Сайт ↗</a>}
                {instagram && <a href={instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-[11px] text-pink-300">Instagram</a>}
                {telegram && <a href={telegram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-[11px] text-sky-300">Telegram</a>}
                {vk && <a href={vk} target="_blank" rel="noopener noreferrer" className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-300">VK</a>}
                {youtube && <a href={youtube} target="_blank" rel="noopener noreferrer" className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] text-red-300">YouTube</a>}
              </div>

              <Link href="/partners" className="mt-5 block text-center text-xs text-zinc-500 transition hover:text-white">
                ← Все партнёры
              </Link>
            </div>
          </aside>
        </div>

        {gallery.length > 1 && (
          <section className="mt-6 rounded-3xl border border-zinc-800 bg-zinc-900/30 p-6 sm:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Альбом</p>
                <h2 className="mt-2 text-2xl font-bold text-white">Работы и атмосфера</h2>
              </div>
              <span className="text-xs text-zinc-600">{gallery.length} фото</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((src, index) => (
                <div key={`${src}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                  <Image
                    src={src}
                    alt={`${partner.name} — фото ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-950/30 to-zinc-900/50 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Партнёрство</p>
            <h2 className="mt-1 text-2xl font-bold text-white">Хотите стать партнёром АВТОWAY?</h2>
            <p className="mt-1 text-sm text-zinc-400">Расскажите о своём проекте — обсудим формат и условия.</p>
          </div>
          <Link
            href="/contacts"
            className="shrink-0 rounded-xl bg-red-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Обсудить сотрудничество
          </Link>
        </div>
      </div>
    </div>
  );
}
