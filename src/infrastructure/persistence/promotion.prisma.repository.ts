import { getPrismaClient } from "./prisma.client";
import { randomUUID } from "node:crypto";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";
import type {
  AdSlot,
  AdSlotInput,
  CampaignStatus,
  PromotionCampaign,
  PromotionCampaignInput,
  PromotionChannel,
} from "@/entities/promotion/promotion.types";

function iso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function toCampaign(row: any): PromotionCampaign {
  return {
    id: row.id,
    title: row.title,
    channel: row.channel as PromotionChannel,
    status: (row.status ?? "planned") as CampaignStatus,
    budget: row.budget ?? undefined,
    spend: row.spend ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    targetUrl: row.targetUrl ?? undefined,
    utmSource: row.utmSource ?? undefined,
    utmMedium: row.utmMedium ?? undefined,
    utmCampaign: row.utmCampaign ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toSlot(row: any): AdSlot {
  return {
    id: row.id,
    key: row.key,
    title: row.title,
    placement: row.placement,
    html: row.html ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    targetUrl: row.targetUrl ?? undefined,
    height: row.height ?? 250,
    isActive: row.isActive,
    startsAt: row.startsAt ? iso(row.startsAt) : undefined,
    endsAt: row.endsAt ? iso(row.endsAt) : undefined,
    impressions: row.impressions ?? 0,
    clicks: row.clicks ?? 0,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export class PrismaPromotionRepository implements PromotionRepository {
  private get db() {
    return getPrismaClient();
  }

  async listCampaigns(): Promise<PromotionCampaign[]> {
    const rows = await this.db.promotionCampaign.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toCampaign);
  }

  async getCampaign(id: string): Promise<PromotionCampaign | null> {
    const row = await this.db.promotionCampaign.findUnique({ where: { id } });
    return row ? toCampaign(row) : null;
  }

  async createCampaign(input: PromotionCampaignInput): Promise<PromotionCampaign> {
    const row = await this.db.promotionCampaign.create({
      data: {
        id: randomUUID(),
        title: input.title,
        channel: input.channel,
        status: input.status ?? "planned",
        budget: input.budget ?? null,
        spend: input.spend ?? null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        targetUrl: input.targetUrl || null,
        utmSource: input.utmSource || null,
        utmMedium: input.utmMedium || null,
        utmCampaign: input.utmCampaign || null,
        notes: input.notes || null,
      },
    });
    return toCampaign(row);
  }

  async updateCampaign(id: string, input: Partial<PromotionCampaignInput>): Promise<PromotionCampaign> {
    const data: Record<string, unknown> = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.channel !== undefined) data.channel = input.channel;
    if (input.status !== undefined) data.status = input.status;
    if (input.budget !== undefined) data.budget = input.budget ?? null;
    if (input.spend !== undefined) data.spend = input.spend ?? null;
    if (input.startDate !== undefined) data.startDate = input.startDate || null;
    if (input.endDate !== undefined) data.endDate = input.endDate || null;
    if (input.targetUrl !== undefined) data.targetUrl = input.targetUrl || null;
    if (input.utmSource !== undefined) data.utmSource = input.utmSource || null;
    if (input.utmMedium !== undefined) data.utmMedium = input.utmMedium || null;
    if (input.utmCampaign !== undefined) data.utmCampaign = input.utmCampaign || null;
    if (input.notes !== undefined) data.notes = input.notes || null;

    const row = await this.db.promotionCampaign.update({ where: { id }, data });
    return toCampaign(row);
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.db.promotionCampaign.delete({ where: { id } });
  }

  async listSlots(): Promise<AdSlot[]> {
    const rows = await this.db.adSlot.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map(toSlot);
  }

  async getSlot(id: string): Promise<AdSlot | null> {
    const row = await this.db.adSlot.findUnique({ where: { id } });
    return row ? toSlot(row) : null;
  }

  async getSlotByKey(key: string): Promise<AdSlot | null> {
    const row = await this.db.adSlot.findUnique({ where: { key } });
    return row ? toSlot(row) : null;
  }

  async getServedSlot(key: string): Promise<AdSlot | null> {
    const now = new Date();
    const row = await this.db.adSlot.findFirst({
      where: {
        key,
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    });
    return row ? toSlot(row) : null;
  }

  async createSlot(input: AdSlotInput): Promise<AdSlot> {
    const row = await this.db.adSlot.create({
      data: {
        id: randomUUID(),
        key: input.key,
        title: input.title,
        placement: input.placement,
        html: input.html || null,
        imageUrl: input.imageUrl || null,
        targetUrl: input.targetUrl || null,
        height: input.height ?? 250,
        isActive: input.isActive ?? false,
        startsAt: toDate(input.startsAt),
        endsAt: toDate(input.endsAt),
      },
    });
    return toSlot(row);
  }

  async updateSlot(id: string, input: Partial<AdSlotInput>): Promise<AdSlot> {
    const data: Record<string, unknown> = {};
    if (input.key !== undefined) data.key = input.key;
    if (input.title !== undefined) data.title = input.title;
    if (input.placement !== undefined) data.placement = input.placement;
    if (input.html !== undefined) data.html = input.html || null;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl || null;
    if (input.targetUrl !== undefined) data.targetUrl = input.targetUrl || null;
    if (input.height !== undefined) data.height = input.height;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.startsAt !== undefined) data.startsAt = toDate(input.startsAt);
    if (input.endsAt !== undefined) data.endsAt = toDate(input.endsAt);

    const row = await this.db.adSlot.update({ where: { id }, data });
    return toSlot(row);
  }

  async deleteSlot(id: string): Promise<void> {
    await this.db.adSlot.delete({ where: { id } });
  }

  async trackImpression(id: string): Promise<void> {
    await this.db.adSlot.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
  }

  async trackClick(id: string): Promise<string | null> {
    const slot = await this.db.adSlot.findUnique({ where: { id } });
    if (!slot) return null;
    await this.db.adSlot.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
    return slot.targetUrl || slot.imageUrl || null;
  }
}
