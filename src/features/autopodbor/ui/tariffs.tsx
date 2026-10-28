import type { AutoPodborTariff } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { parseList, tariffPrice } from "../lib/parse";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";
import ServiceCta from "./service-cta";

function TariffCard({ tariff, compact = false }: { tariff: AutoPodborTariff; compact?: boolean }) {
  const includes = parseList(tariff.includes);
  const price = tariffPrice(tariff);
  const ctaLabel = tariff.ctaLabel || "Оставить заявку";

  return (
    <article
      className={`relative flex h-full flex-col rounded-2xl border ${
        compact ? "p-4" : "p-5 sm:p-6"
      } ${
        tariff.isPopular
          ? "border-primary/40 bg-gradient-to-b from-red-500/10 to-zinc-900/40"
          : "border-zinc-800 bg-zinc-900/40 transition hover:border-zinc-700 hover:bg-zinc-900"
      }`}
    >
      {tariff.badge && (
        <span className="mb-3 inline-flex w-fit rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
          {tariff.badge}
        </span>
      )}

      <div className="mb-1 flex items-start gap-2">
        <AutoIcon name={tariff.icon} className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <h3 className={`font-semibold text-white ${compact ? "text-base" : "text-lg"}`}>{tariff.title}</h3>
      </div>

      {price && (
        <p className={`mt-2 font-bold text-green-400 ${compact ? "text-xl" : "text-2xl"}`}>{price}</p>
      )}
      {tariff.duration && <p className="mt-1 text-xs text-zinc-500">{tariff.duration}</p>}

      {tariff.description && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{tariff.description}</p>
      )}

      {includes.length > 0 && (
        <ul className="mt-4 flex-1 space-y-2 border-t border-zinc-800/70 pt-4">
          {includes.map(item => (
            <li key={item} className="flex items-start gap-2 text-xs text-zinc-400">
              <AutoIcon name="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
              {item}
            </li>
          ))}
        </ul>
      )}

      <ServiceCta
        slug={tariff.slug}
        label={ctaLabel}
        variant={tariff.isPopular ? "primary" : "secondary"}
        className="mt-5 w-full"
      />
    </article>
  );
}

export default function Tariffs({
  heading,
  tariffs,
  disclaimer,
}: {
  heading: SectionHeadingData;
  tariffs: AutoPodborTariff[];
  disclaimer?: string;
}) {
  if (tariffs.length === 0) return null;

  const main = tariffs.filter(tariff => tariff.groupName === "rb");
  const extras = tariffs.filter(tariff => tariff.groupName !== "rb");
  const mainTariffs = main.length > 0 ? main : tariffs;
  const extraTariffs = main.length > 0 ? extras : [];

  return (
    <section id="tariffs" className="scroll-mt-24 border-b border-zinc-800/50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="-mx-6 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-6 pb-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
          {mainTariffs.map(tariff => (
            <div key={tariff.id} className="w-[85%] shrink-0 snap-center sm:w-auto">
              <TariffCard tariff={tariff} />
            </div>
          ))}
        </div>

        {extraTariffs.length > 0 && (
          <div className="mt-10 border-t border-zinc-800/60 pt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Дополнительно
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {extraTariffs.map((tariff, index) => (
                <div
                  key={tariff.id}
                  className={
                    extraTariffs.length % 2 === 1 && index === extraTariffs.length - 1
                      ? "col-span-2 sm:col-span-1"
                      : ""
                  }
                >
                  <TariffCard tariff={tariff} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-1 text-center">
          <p className="text-sm text-zinc-400">Выезд за МКАД — 0,35 BYN/км в обе стороны.</p>
          {disclaimer && <p className="text-xs text-zinc-600">{disclaimer}</p>}
        </div>
      </div>
    </section>
  );
}
