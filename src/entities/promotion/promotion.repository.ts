import type {
  AdSlot,
  AdSlotInput,
  PromotionCampaign,
  PromotionCampaignInput,
} from "./promotion.types";

export interface PromotionRepository {
  listCampaigns(): Promise<PromotionCampaign[]>;
  getCampaign(id: string): Promise<PromotionCampaign | null>;
  createCampaign(input: PromotionCampaignInput): Promise<PromotionCampaign>;
  updateCampaign(id: string, input: Partial<PromotionCampaignInput>): Promise<PromotionCampaign>;
  deleteCampaign(id: string): Promise<void>;

  listSlots(): Promise<AdSlot[]>;
  getSlot(id: string): Promise<AdSlot | null>;
  getSlotByKey(key: string): Promise<AdSlot | null>;
  /** Активный слот на текущий момент (учитывает даты показа). */
  getServedSlot(key: string): Promise<AdSlot | null>;
  createSlot(input: AdSlotInput): Promise<AdSlot>;
  updateSlot(id: string, input: Partial<AdSlotInput>): Promise<AdSlot>;
  deleteSlot(id: string): Promise<void>;
  trackImpression(id: string): Promise<void>;
  trackClick(id: string): Promise<string | null>;
}
