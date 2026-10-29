export interface Vacancy {
  id: string;
  slug: string;
  title: string;
  department?: string;
  location: string;
  employmentType: string;
  workFormat?: string;
  experience?: string;
  schedule?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryCurrency: string;
  salaryPeriod: string;
  salaryType: string;
  salaryNote?: string;
  shortDescription: string;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  conditions?: string;
  benefits?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactTelegram?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export type VacancyInput = Omit<Vacancy, "id" | "createdAt" | "updatedAt">;
export type VacancyUpdate = Partial<Omit<VacancyInput, "salaryFrom" | "salaryTo">> & {
  salaryFrom?: number | null;
  salaryTo?: number | null;
};
