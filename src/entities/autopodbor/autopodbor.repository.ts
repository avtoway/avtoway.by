import type {
  AutoPodborCase,
  AutoPodborCheckItem,
  AutoPodborCity,
  AutoPodborFaq,
  AutoPodborFeature,
  AutoPodborGalleryItem,
  AutoPodborLead,
  AutoPodborPromo,
  AutoPodborPublicData,
  AutoPodborReview,
  AutoPodborSection,
  AutoPodborSettings,
  AutoPodborStats,
  AutoPodborStep,
  AutoPodborTariff,
  LeadFilters,
  LeadListResult,
} from "./autopodbor.types";

type New<T> = Omit<T, "id">;
type Patch<T> = Partial<Omit<T, "id">>;

export type NewLead = Omit<AutoPodborLead, "id" | "createdAt" | "updatedAt" | "status" | "assignedTo">;

export interface AutoPodborRepository {
  getSettings(): Promise<AutoPodborSettings>;
  updateSettings(data: Patch<AutoPodborSettings>): Promise<AutoPodborSettings>;

  getSections(activeOnly?: boolean): Promise<AutoPodborSection[]>;
  createSection(data: New<AutoPodborSection>): Promise<AutoPodborSection>;
  updateSection(id: string, data: Patch<AutoPodborSection>): Promise<AutoPodborSection>;
  deleteSection(id: string): Promise<void>;

  getTariffs(activeOnly?: boolean): Promise<AutoPodborTariff[]>;
  createTariff(data: New<AutoPodborTariff>): Promise<AutoPodborTariff>;
  updateTariff(id: string, data: Patch<AutoPodborTariff>): Promise<AutoPodborTariff>;
  deleteTariff(id: string): Promise<void>;

  getSteps(activeOnly?: boolean): Promise<AutoPodborStep[]>;
  createStep(data: New<AutoPodborStep>): Promise<AutoPodborStep>;
  updateStep(id: string, data: Patch<AutoPodborStep>): Promise<AutoPodborStep>;
  deleteStep(id: string): Promise<void>;

  getFeatures(activeOnly?: boolean): Promise<AutoPodborFeature[]>;
  createFeature(data: New<AutoPodborFeature>): Promise<AutoPodborFeature>;
  updateFeature(id: string, data: Patch<AutoPodborFeature>): Promise<AutoPodborFeature>;
  deleteFeature(id: string): Promise<void>;

  getChecks(activeOnly?: boolean): Promise<AutoPodborCheckItem[]>;
  createCheck(data: New<AutoPodborCheckItem>): Promise<AutoPodborCheckItem>;
  updateCheck(id: string, data: Patch<AutoPodborCheckItem>): Promise<AutoPodborCheckItem>;
  deleteCheck(id: string): Promise<void>;

  getCases(activeOnly?: boolean): Promise<AutoPodborCase[]>;
  createCase(data: New<AutoPodborCase>): Promise<AutoPodborCase>;
  updateCase(id: string, data: Patch<AutoPodborCase>): Promise<AutoPodborCase>;
  deleteCase(id: string): Promise<void>;

  getReviews(activeOnly?: boolean): Promise<AutoPodborReview[]>;
  createReview(data: New<AutoPodborReview>): Promise<AutoPodborReview>;
  updateReview(id: string, data: Patch<AutoPodborReview>): Promise<AutoPodborReview>;
  deleteReview(id: string): Promise<void>;

  getFaq(activeOnly?: boolean): Promise<AutoPodborFaq[]>;
  createFaq(data: New<AutoPodborFaq>): Promise<AutoPodborFaq>;
  updateFaq(id: string, data: Patch<AutoPodborFaq>): Promise<AutoPodborFaq>;
  deleteFaq(id: string): Promise<void>;

  getGallery(activeOnly?: boolean): Promise<AutoPodborGalleryItem[]>;
  createGalleryItem(data: New<AutoPodborGalleryItem>): Promise<AutoPodborGalleryItem>;
  updateGalleryItem(id: string, data: Patch<AutoPodborGalleryItem>): Promise<AutoPodborGalleryItem>;
  deleteGalleryItem(id: string): Promise<void>;

  getCities(activeOnly?: boolean): Promise<AutoPodborCity[]>;
  createCity(data: New<AutoPodborCity>): Promise<AutoPodborCity>;
  updateCity(id: string, data: Patch<AutoPodborCity>): Promise<AutoPodborCity>;
  deleteCity(id: string): Promise<void>;

  getPromos(activeOnly?: boolean): Promise<AutoPodborPromo[]>;
  createPromo(data: New<AutoPodborPromo>): Promise<AutoPodborPromo>;
  updatePromo(id: string, data: Patch<AutoPodborPromo>): Promise<AutoPodborPromo>;
  deletePromo(id: string): Promise<void>;

  getPublicData(): Promise<AutoPodborPublicData>;

  createLead(data: NewLead): Promise<AutoPodborLead>;
  getLeads(filters?: LeadFilters): Promise<LeadListResult>;
  getLead(id: string): Promise<AutoPodborLead | null>;
  updateLead(id: string, data: Patch<AutoPodborLead>): Promise<AutoPodborLead>;
  deleteLead(id: string): Promise<void>;
  countNewLeads(): Promise<number>;
  getStats(): Promise<AutoPodborStats>;
}
