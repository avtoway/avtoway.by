import Image from "next/image";
import type { AutoPodborSettings } from "@/entities/autopodbor/autopodbor.types";
import { telegramUrl } from "@/shared/lib/social";
import type { SectionHeadingData } from "../lib/defaults";
import { initials, parseList } from "../lib/parse";
import { publicAssetExists } from "../lib/assets";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

export default function Expert({ heading, settings }: { heading: SectionHeadingData; settings: AutoPodborSettings }) {
  if (!settings.expertName && !settings.expertQuote) return null;

  const facts = parseList(settings.expertFacts);
  const telegram = telegramUrl(settings.telegram);
  const hasPhoto = publicAssetExists(settings.expertPhoto);

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} align="left" />

        <div className="grid items-center gap-8 lg:grid-cols-[320px_1fr] lg:gap-14">
          <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 ring-1 ring-white/5">
            {hasPhoto ? (
              <>
                <Image
                  src={settings.expertPhoto as string}
                  alt={settings.expertName || "Эксперт АВТОWAY"}
                  fill
                  sizes="(max-width: 1024px) 80vw, 320px"
                  className="object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/50 via-transparent to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.12),transparent_70%)]">
                <span className="flex h-24 w-24 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-3xl font-bold text-zinc-300">
                  {initials(settings.expertName)}
                </span>
                <span className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-600">Фото скоро появится</span>
              </div>
            )}
          </div>

          <div>
            <p className="text-2xl font-bold text-white sm:text-3xl">{settings.expertName}</p>
            {settings.expertRole && <p className="mt-1 text-sm text-zinc-500">{settings.expertRole}</p>}

            {settings.expertQuote && (
              <blockquote className="mt-5 border-l-2 border-primary/60 pl-5 text-lg leading-relaxed text-zinc-300">
                «{settings.expertQuote}»
              </blockquote>
            )}

            {facts.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {facts.map(fact => (
                  <li
                    key={fact}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-400"
                  >
                    <AutoIcon name="check" className="h-3.5 w-3.5 text-green-400" />
                    {fact}
                  </li>
                ))}
              </ul>
            )}

            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition hover:bg-primary-dark"
              >
                <AutoIcon name="telegram" className="h-4 w-4" />
                Написать лично
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
