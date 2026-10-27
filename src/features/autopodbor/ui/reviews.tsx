import type { AutoPodborReview } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import { REVIEW_SOURCE_LABEL } from "../lib/parse";
import SectionHeading from "./section-heading";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Оценка ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} viewBox="0 0 24 24" className={`h-4 w-4 ${i <= rating ? "text-amber-400" : "text-zinc-700"}`} fill="currentColor" aria-hidden="true">
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.9L12 3.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews({ heading, items }: { heading: SectionHeadingData; items: AutoPodborReview[] }) {
  if (items.length === 0) return null;

  const average = items.reduce((sum, item) => sum + item.rating, 0) / items.length;
  const rounded = Math.round(average * 10) / 10;
  const sources = [...new Set(items.map(item => item.source))];

  return (
    <section className="border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white">{rounded.toFixed(1)}</span>
            <span className="text-sm text-zinc-500">из 5</span>
          </div>
          <Stars rating={Math.round(average)} />
          <span className="text-sm text-zinc-500">{items.length} отзывов</span>
          {sources.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {sources.map(source => (
                <span key={source} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-[11px] text-zinc-400">
                  {REVIEW_SOURCE_LABEL[source] ?? source}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(review => (
            <figure key={review.id} className="h-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <Stars rating={review.rating} />
              <blockquote className="mt-3 text-sm leading-relaxed text-zinc-300">{review.text}</blockquote>
              <figcaption className="mt-5 border-t border-zinc-800/70 pt-4 text-xs text-zinc-500">
                <span className="font-medium text-zinc-300">{review.name}</span>
                {review.city && <span> · {review.city}</span>}
                {review.car && <span> · {review.car}</span>}
                <span className="mt-1 flex items-center gap-1.5">
                  {REVIEW_SOURCE_LABEL[review.source] ?? review.source}
                  {review.sourceUrl && (
                    <a href={review.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                      источник
                    </a>
                  )}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
