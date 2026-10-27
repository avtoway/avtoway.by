import Reveal from "@/shared/ui/reveal";
import type { AutoPodborGalleryItem } from "@/entities/autopodbor/autopodbor.types";
import type { SectionHeadingData } from "../lib/defaults";
import SectionHeading from "./section-heading";
import AutoIcon from "./icon";

const SCORES = [
  { label: "Кузов", value: 4 },
  { label: "Двигатель", value: 4 },
  { label: "КПП", value: 3 },
  { label: "Электроника", value: 5 },
  { label: "Юр. чистота", value: 5 },
];

const FINDINGS = [
  "Окрашено: заднее крыло, бампер.",
  "Заменено: лобовое стекло.",
  "Ошибки: датчик парковки.",
  "Пробег: подтверждён.",
];

export default function Report({
  heading,
  gallery,
  description,
}: {
  heading: SectionHeadingData;
  gallery: AutoPodborGalleryItem[];
  description?: string;
}) {
  return (
    <section id="report" className="scroll-mt-24 border-b border-zinc-800/50 py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading {...heading} />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/60 px-5 py-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <AutoIcon name="document" className="h-5 w-5 text-primary" />
                  Отчёт об осмотре
                </div>
                <span className="text-xs text-zinc-500">Volkswagen Passat B8 · 2019</span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-3">
                  {SCORES.map(score => (
                    <div key={score.label} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-zinc-400">{score.label}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${score.value >= 4 ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${(score.value / 5) * 100}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs text-zinc-400">{score.value}/5</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">Найдено</p>
                  <ul className="space-y-1.5 text-sm text-zinc-300">
                    {FINDINGS.map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
                  <span className="font-medium">Вердикт:</span> покупать после торга. Рекомендуемый торг: −800 BYN.
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="#lead"
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary-dark"
                  >
                    Заказать осмотр
                  </a>
                  {gallery.length > 0 && (
                    <a
                      href="#report-gallery"
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-white/5 px-5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    >
                      Смотреть пример отчёта
                    </a>
                  )}
                </div>

                <p className="mt-3 text-[11px] text-zinc-600">
                  Пример реального отчёта. Фото клиентов публикуем только с согласия.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-primary">
                  <AutoIcon name="shield" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">150+ фото и видео</p>
                  <p className="text-xs text-zinc-500">замеры, ошибки, комментарии</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-zinc-400">
                {description || "Вы видите не «машина норм», а конкретные замеры, найденные дефекты и понятный вердикт: покупать, торговаться или отказаться."}
              </p>

              <ul className="mt-auto space-y-2 border-t border-zinc-800/70 pt-4 text-sm text-zinc-300">
                {["Фото всех элементов кузова", "Скриншоты ошибок и параметров", "Замеры толщиномера", "Рекомендации по торгу"].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <AutoIcon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {gallery.length > 0 && (
          <div id="report-gallery" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {gallery.map(item => (
              <a
                key={item.id}
                href={item.photo}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo} alt={item.alt} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
