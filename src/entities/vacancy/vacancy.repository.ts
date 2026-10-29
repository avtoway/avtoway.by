import type { Vacancy, VacancyInput, VacancyUpdate } from "./vacancy";

export interface VacancyRepository {
  getAll(): Promise<Vacancy[]>;
  getActive(): Promise<Vacancy[]>;
  getById(id: string): Promise<Vacancy | null>;
  getBySlug(slug: string): Promise<Vacancy | null>;
  create(data: VacancyInput): Promise<Vacancy>;
  update(id: string, data: VacancyUpdate): Promise<Vacancy>;
  delete(id: string): Promise<void>;
}
