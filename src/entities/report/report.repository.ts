import type { InspectionReport, InspectionReportInput } from "./report.types";

export interface InspectionReportRepository {
  list(): Promise<InspectionReport[]>;
  getById(id: string): Promise<InspectionReport | null>;
  getByToken(token: string): Promise<InspectionReport | null>;
  create(input: InspectionReportInput & { token: string }): Promise<InspectionReport>;
  update(id: string, input: Partial<InspectionReportInput>): Promise<InspectionReport>;
  delete(id: string): Promise<void>;
}
