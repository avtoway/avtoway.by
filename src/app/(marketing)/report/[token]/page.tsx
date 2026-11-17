import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { InspectionReportRepository } from "@/entities/report/report.repository";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { InspectionReport, ReportCheckStatus, ReportVerdict } from "@/entities/report/report.types";
import PrintReportButton from "@/features/autopodbor/ui/print-report-button";
import { getActiveServices } from "@/shared/lib/active-services.server";

interface Props {
  params: Promise<{ token: string }>;
}

const VERDICT: Record<ReportVerdict, { label: string; hint: string; className: string }> = {
  recommended: {
    label: "Можно брать",
    hint: "Критических проблем не найдено. Есть замечания, которые учтены в торге.",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  caution: {
    label: "Нужны вложения",
    hint: "Авто можно брать, но потребуется ремонт. Сумма учтена в рекомендациях.",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  reject: {
    label: "Не рекомендуется",
    hint: "Найдены серьёзные проблемы. Покупка без торга и ремонта нецелесообразна.",
    className: "border-red-500/30 bg-red-500/10 text-red-300",
  },
};

const CHECK: Record<ReportCheckStatus, { icon: string; className: string; label: string }> = {
  ok: { icon: "✓", className: "text-emerald-400", label: "Норма" },
  attention: { icon: "!", className: "text-amber-400", label: "Замечание" },
  critical: { icon: "✕", className: "text-red-400", label: "Критично" },
};

async function getReport(token: string) {
  return container.get<InspectionReportRepository>("InspectionReportRepository").getByToken(token);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const report = await getReport(token);
  if (!report || !report.isPublished) {
    return { title: "Отчёт не найден", robots: { index: false, follow: false } };
  }
  return {
    title: `Отчёт осмотра: ${report.carTitle}`,
    description: "Цифровой отчёт проверки автомобиля АВТОWAY.",
    robots: { index: false, follow: false },
  };
}

function groupChecklist(report: InspectionReport) {
  const groups = new Map<string, InspectionReport["checklist"]>();
  for (const item of report.checklist) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }
  return [...groups.entries()];
}

export default async function ReportPage({ params }: Props) {
  const { token } = await params;
  const report = await getReport(token);
  if (!report || !report.isPublished) notFound();

  const [contact, services] = await Promise.all([
    container.get<ContactInfoRepository>("ContactInfoRepository").get(),
    getActiveServices(),
  ]);
  const inspectionActive = services.some(service => service.slug === "inspection");
  const verdict = VERDICT[report.verdict] ?? VERDICT.recommended;
  const groups = groupChecklist(report);
  const expensesTotal = report.expenses.reduce((sum, item) => sum + item.amount, 0);
  const criticalCount = report.checklist.filter(item => item.status === "critical").length;
  const attentionCount = report.checklist.filter(item => item.status === "attention").length;

  return (
    <div className="min-h-screen bg-zinc-950 pb-20 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={inspectionActive ? "/services/inspection" : "/"}
            className="text-xs text-zinc-500 transition hover:text-white"
          >
            {inspectionActive ? "← Автоподбор АВТОWAY" : "← На главную"}
          </Link>
          <PrintReportButton />
        </div>

        <header className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/60 to-zinc-950 p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">Цифровой отчёт осмотра</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{report.carTitle}</h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-zinc-400">
            {report.inspectedAt && <span>Дата осмотра: {report.inspectedAt}</span>}
            {report.mileageKm != null && <span>Пробег: {report.mileageKm.toLocaleString("ru-RU")} км</span>}
            {report.vin && <span>VIN: {report.vin}</span>}
            {report.clientName && <span>Клиент: {report.clientName}</span>}
          </div>
          <div className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${verdict.className}`}>
            Вердикт: {verdict.label}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{verdict.hint}</p>
        </header>

        {report.summary && (
          <section className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Заключение эксперта</h2>
            <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-200">{report.summary}</div>
          </section>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Пунктов проверки</p>
            <p className="mt-1 text-2xl font-bold text-white">{report.checklist.length}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-amber-400">Замечаний</p>
            <p className="mt-1 text-2xl font-bold text-white">{attentionCount}</p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-[10px] uppercase tracking-wider text-red-400">Критичных</p>
            <p className="mt-1 text-2xl font-bold text-white">{criticalCount}</p>
          </div>
        </div>

        {groups.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-white">Результаты проверки</h2>
            <div className="space-y-4">
              {groups.map(([category, items]) => (
                <div key={category} className="overflow-hidden rounded-2xl border border-zinc-800">
                  <p className="bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">{category}</p>
                  <ul>
                    {items.map((item, index) => {
                      const state = CHECK[item.status] ?? CHECK.ok;
                      return (
                        <li key={`${item.title}-${index}`} className="flex items-start gap-3 border-t border-zinc-800/60 px-4 py-3">
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold ${state.className}`}>
                            {state.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm text-zinc-200">{item.title}</p>
                            {item.note && <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{item.note}</p>}
                          </div>
                          <span className={`ml-auto shrink-0 text-[10px] uppercase tracking-wider ${state.className}`}>{state.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {report.expenses.length > 0 && (
          <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Предстоящие расходы</h2>
            <ul className="mt-3 divide-y divide-zinc-800/60">
              {report.expenses.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                  <span className="text-zinc-300">{item.label}</span>
                  <span className="shrink-0 font-medium text-white">{item.amount.toLocaleString("ru-RU")} BYN</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-3 text-sm font-semibold">
              <span className="text-zinc-400">Итого</span>
              <span className="text-red-300">{expensesTotal.toLocaleString("ru-RU")} BYN</span>
            </div>
          </section>
        )}

        {report.photos.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-white">Фото с осмотра</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {report.photos.map(photo => (
                <div key={photo} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                  <Image src={photo} alt={report.carTitle} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-zinc-900/50 to-zinc-950 p-6 text-center sm:p-8">
          <h2 className="text-xl font-bold text-white">Хотите так же проверить своё авто?</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Осмотр кузова, техники и документов с отчётом и рекомендациями по торгу.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={inspectionActive ? "/services/inspection" : "/contacts"}
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white"
            >
              {inspectionActive ? "Заказать проверку" : "Связаться с нами"}
            </Link>
            {contact?.phone && (
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex h-11 items-center rounded-full border border-zinc-700 px-6 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                {contact.phone}
              </a>
            )}
          </div>
        </section>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-zinc-600">
          Отчёт носит информационный характер и отражает состояние автомобиля на дату осмотра.
          Ссылка персональная — не публикуйте её без необходимости.
        </p>
      </div>
    </div>
  );
}
