import { getPrismaClient } from "./prisma.client";
import { randomUUID } from "node:crypto";
import type { InspectionReportRepository } from "@/entities/report/report.repository";
import type {
  InspectionReport,
  InspectionReportInput,
  ReportChecklistItem,
  ReportExpense,
  ReportVerdict,
} from "@/entities/report/report.types";

function parseList<T>(value: string | null | undefined): T[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function iso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function toReport(row: any): InspectionReport {
  return {
    id: row.id,
    token: row.token,
    leadId: row.leadId ?? undefined,
    clientName: row.clientName ?? undefined,
    clientPhone: row.clientPhone ?? undefined,
    carTitle: row.carTitle,
    vin: row.vin ?? undefined,
    mileageKm: row.mileageKm ?? undefined,
    inspectedAt: row.inspectedAt ?? undefined,
    verdict: (row.verdict ?? "recommended") as ReportVerdict,
    summary: row.summary ?? undefined,
    checklist: parseList<ReportChecklistItem>(row.checklist),
    expenses: parseList<ReportExpense>(row.expenses),
    photos: parseList<string>(row.photos),
    isPublished: row.isPublished,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export class PrismaInspectionReportRepository implements InspectionReportRepository {
  private get db() { return getPrismaClient(); }

  async list(): Promise<InspectionReport[]> {
    const rows = await this.db.inspectionReport.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toReport);
  }

  async getById(id: string): Promise<InspectionReport | null> {
    const row = await this.db.inspectionReport.findUnique({ where: { id } });
    return row ? toReport(row) : null;
  }

  async getByToken(token: string): Promise<InspectionReport | null> {
    const row = await this.db.inspectionReport.findUnique({ where: { token } });
    return row ? toReport(row) : null;
  }

  async create(input: InspectionReportInput & { token: string }): Promise<InspectionReport> {
    const row = await this.db.inspectionReport.create({
      data: {
        id: randomUUID(),
        token: input.token,
        leadId: input.leadId || null,
        clientName: input.clientName || null,
        clientPhone: input.clientPhone || null,
        carTitle: input.carTitle,
        vin: input.vin || null,
        mileageKm: input.mileageKm ?? null,
        inspectedAt: input.inspectedAt || null,
        verdict: input.verdict ?? "recommended",
        summary: input.summary || null,
        checklist: JSON.stringify(input.checklist ?? []),
        expenses: JSON.stringify(input.expenses ?? []),
        photos: JSON.stringify(input.photos ?? []),
        isPublished: input.isPublished ?? false,
      },
    });
    return toReport(row);
  }

  async update(id: string, input: Partial<InspectionReportInput>): Promise<InspectionReport> {
    const data: Record<string, unknown> = {};
    if (input.leadId !== undefined) data.leadId = input.leadId || null;
    if (input.clientName !== undefined) data.clientName = input.clientName || null;
    if (input.clientPhone !== undefined) data.clientPhone = input.clientPhone || null;
    if (input.carTitle !== undefined) data.carTitle = input.carTitle;
    if (input.vin !== undefined) data.vin = input.vin || null;
    if (input.mileageKm !== undefined) data.mileageKm = input.mileageKm ?? null;
    if (input.inspectedAt !== undefined) data.inspectedAt = input.inspectedAt || null;
    if (input.verdict !== undefined) data.verdict = input.verdict;
    if (input.summary !== undefined) data.summary = input.summary || null;
    if (input.checklist !== undefined) data.checklist = JSON.stringify(input.checklist);
    if (input.expenses !== undefined) data.expenses = JSON.stringify(input.expenses);
    if (input.photos !== undefined) data.photos = JSON.stringify(input.photos);
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;

    const row = await this.db.inspectionReport.update({ where: { id }, data });
    return toReport(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.inspectionReport.delete({ where: { id } });
  }
}
