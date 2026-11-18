import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { InspectionReportRepository } from "@/entities/report/report.repository";
import ReportView from "@/features/reports/ui/report-view";
import { getCachedContactInfo } from "@/shared/lib/contact-info.server";
import { getActiveServices } from "@/shared/lib/active-services.server";

interface Props {
  params: Promise<{ token: string }>;
}

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

export default async function ReportPage({ params }: Props) {
  const { token } = await params;
  const report = await getReport(token);
  if (!report || !report.isPublished) notFound();

  const [contact, services] = await Promise.all([getCachedContactInfo(), getActiveServices()]);
  const inspectionActive = services.some(service => service.slug === "inspection");

  return <ReportView report={report} contact={contact} inspectionActive={inspectionActive} />;
}
