import { getPrismaClient } from "./prisma.client";
import type { AutoPodborRepository, NewLead } from "@/entities/autopodbor/autopodbor.repository";
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
} from "@/entities/autopodbor/autopodbor.types";

/* ─── mappers ─── */

function iso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? "");
}

function toSettings(row: any): AutoPodborSettings {
  return {
    id: row.id,
    isActive: row.isActive,
    heroBadge: row.heroBadge ?? undefined,
    heroTitle: row.heroTitle,
    heroHighlight: row.heroHighlight ?? undefined,
    heroSubtitle: row.heroSubtitle ?? undefined,
    heroImage: row.heroImage ?? undefined,
    heroImageAlt: row.heroImageAlt ?? undefined,
    priceFrom: row.priceFrom ?? undefined,
    ctaPrimaryLabel: row.ctaPrimaryLabel,
    ctaSecondaryLabel: row.ctaSecondaryLabel,
    phone: row.phone ?? undefined,
    telegram: row.telegram ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    viber: row.viber ?? undefined,
    address: row.address ?? undefined,
    workingHours: row.workingHours ?? undefined,
    yearsExperience: row.yearsExperience ?? undefined,
    carsChecked: row.carsChecked ?? undefined,
    citiesCount: row.citiesCount ?? undefined,
    guaranteeDays: row.guaranteeDays ?? undefined,
    avgSavings: row.avgSavings ?? undefined,
    reportTime: row.reportTime ?? undefined,
    expertName: row.expertName ?? undefined,
    expertRole: row.expertRole ?? undefined,
    expertQuote: row.expertQuote ?? undefined,
    expertPhoto: row.expertPhoto ?? undefined,
    expertFacts: row.expertFacts ?? undefined,
    disclaimer: row.disclaimer ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    ogImage: row.ogImage ?? undefined,
    noindex: row.noindex,
    updatedAt: iso(row.updatedAt),
  };
}

function toSection(row: any): AutoPodborSection {
  return {
    id: row.id,
    key: row.key,
    badge: row.badge ?? undefined,
    title: row.title ?? undefined,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    image: row.image ?? undefined,
    imageAlt: row.imageAlt ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toTariff(row: any): AutoPodborTariff {
  return {
    id: row.id,
    slug: row.slug,
    groupName: row.groupName,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description ?? undefined,
    price: row.price ?? undefined,
    priceFrom: row.priceFrom,
    currency: row.currency,
    unit: row.unit ?? undefined,
    duration: row.duration ?? undefined,
    includes: row.includes ?? undefined,
    badge: row.badge ?? undefined,
    icon: row.icon,
    image: row.image ?? undefined,
    ctaLabel: row.ctaLabel,
    isPopular: row.isPopular,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toStep(row: any): AutoPodborStep {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    duration: row.duration ?? undefined,
    icon: row.icon,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function toFeature(row: any): AutoPodborFeature {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    icon: row.icon,
    stat: row.stat ?? undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function toCheck(row: any): AutoPodborCheckItem {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description ?? undefined,
    isCritical: row.isCritical,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function toCase(row: any): AutoPodborCase {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    year: row.year ?? undefined,
    budget: row.budget ?? undefined,
    purchasePrice: row.purchasePrice ?? undefined,
    tradeAmount: row.tradeAmount ?? undefined,
    days: row.days ?? undefined,
    city: row.city ?? undefined,
    task: row.task ?? undefined,
    found: row.found ?? undefined,
    result: row.result ?? undefined,
    photos: row.photos ?? undefined,
    mainPhoto: row.mainPhoto ?? undefined,
    completedAt: row.completedAt ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toReview(row: any): AutoPodborReview {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? undefined,
    car: row.car ?? undefined,
    rating: row.rating,
    text: row.text,
    source: row.source,
    sourceUrl: row.sourceUrl ?? undefined,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
  };
}

function toFaq(row: any): AutoPodborFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function toGallery(row: any): AutoPodborGalleryItem {
  return {
    id: row.id,
    section: row.section,
    title: row.title ?? undefined,
    alt: row.alt,
    photo: row.photo,
    prompt: row.prompt ?? undefined,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  };
}

function toCity(row: any): AutoPodborCity {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toPromo(row: any): AutoPodborPromo {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    discount: row.discount ?? undefined,
    validUntil: row.validUntil ?? undefined,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toLead(row: any): AutoPodborLead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    messenger: row.messenger ?? undefined,
    city: row.city ?? undefined,
    budgetFrom: row.budgetFrom ?? undefined,
    budgetTo: row.budgetTo ?? undefined,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    serviceSlug: row.serviceSlug ?? undefined,
    serviceTitle: row.serviceTitle ?? undefined,
    comment: row.comment ?? undefined,
    quiz: row.quiz ?? undefined,
    source: row.source,
    status: row.status,
    priceQuoted: row.priceQuoted ?? undefined,
    assignedToId: row.assignedToId ?? undefined,
    assignedTo: row.assignedTo
      ? { id: row.assignedTo.id, name: row.assignedTo.profile?.name ?? row.assignedTo.login }
      : null,
    internalNote: row.internalNote ?? undefined,
    pageUrl: row.pageUrl ?? undefined,
    utmSource: row.utmSource ?? undefined,
    utmMedium: row.utmMedium ?? undefined,
    utmCampaign: row.utmCampaign ?? undefined,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

const LEAD_INCLUDE = { assignedTo: { include: { profile: true } } } as const;

/* ─── repository ─── */

export class PrismaAutoPodborRepository implements AutoPodborRepository {
  private get db() { return getPrismaClient(); }

  /* settings */

  async getSettings(): Promise<AutoPodborSettings> {
    const existing = await this.db.autoPodborSettings.findUnique({ where: { id: "main" } });
    if (existing) return toSettings(existing);
    const created = await this.db.autoPodborSettings.create({
      data: {
        id: "main",
        heroTitle: "Найдём живое авто, а не красивую картинку",
        heroHighlight: "живое авто",
      },
    });
    return toSettings(created);
  }

  async updateSettings(data: Partial<AutoPodborSettings>): Promise<AutoPodborSettings> {
    await this.getSettings();
    const row = await this.db.autoPodborSettings.update({
      where: { id: "main" },
      data: {
        isActive: data.isActive,
        heroBadge: data.heroBadge,
        heroTitle: data.heroTitle,
        heroHighlight: data.heroHighlight,
        heroSubtitle: data.heroSubtitle,
        heroImage: data.heroImage,
        heroImageAlt: data.heroImageAlt,
        priceFrom: data.priceFrom,
        ctaPrimaryLabel: data.ctaPrimaryLabel,
        ctaSecondaryLabel: data.ctaSecondaryLabel,
        phone: data.phone,
        telegram: data.telegram,
        whatsapp: data.whatsapp,
        viber: data.viber,
        address: data.address,
        workingHours: data.workingHours,
        yearsExperience: data.yearsExperience,
        carsChecked: data.carsChecked,
        citiesCount: data.citiesCount,
        guaranteeDays: data.guaranteeDays,
        avgSavings: data.avgSavings,
        reportTime: data.reportTime,
        expertName: data.expertName,
        expertRole: data.expertRole,
        expertQuote: data.expertQuote,
        expertPhoto: data.expertPhoto,
        expertFacts: data.expertFacts,
        disclaimer: data.disclaimer,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        ogImage: data.ogImage,
        noindex: data.noindex,
      },
    });
    return toSettings(row);
  }

  /* sections */

  async getSections(activeOnly = false): Promise<AutoPodborSection[]> {
    const rows = await this.db.autoPodborSection.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toSection);
  }

  async createSection(data: Omit<AutoPodborSection, "id">): Promise<AutoPodborSection> {
    const row = await this.db.autoPodborSection.create({ data: { ...data } });
    return toSection(row);
  }

  async updateSection(id: string, data: Partial<AutoPodborSection>): Promise<AutoPodborSection> {
    const row = await this.db.autoPodborSection.update({ where: { id }, data });
    return toSection(row);
  }

  async deleteSection(id: string): Promise<void> {
    await this.db.autoPodborSection.delete({ where: { id } });
  }

  /* tariffs */

  async getTariffs(activeOnly = false): Promise<AutoPodborTariff[]> {
    const rows = await this.db.autoPodborTariff.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toTariff);
  }

  async createTariff(data: Omit<AutoPodborTariff, "id">): Promise<AutoPodborTariff> {
    const row = await this.db.autoPodborTariff.create({ data: { ...data } });
    return toTariff(row);
  }

  async updateTariff(id: string, data: Partial<AutoPodborTariff>): Promise<AutoPodborTariff> {
    const row = await this.db.autoPodborTariff.update({ where: { id }, data });
    return toTariff(row);
  }

  async deleteTariff(id: string): Promise<void> {
    await this.db.autoPodborTariff.delete({ where: { id } });
  }

  /* steps */

  async getSteps(activeOnly = false): Promise<AutoPodborStep[]> {
    const rows = await this.db.autoPodborStep.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toStep);
  }

  async createStep(data: Omit<AutoPodborStep, "id">): Promise<AutoPodborStep> {
    const row = await this.db.autoPodborStep.create({ data: { ...data } });
    return toStep(row);
  }

  async updateStep(id: string, data: Partial<AutoPodborStep>): Promise<AutoPodborStep> {
    const row = await this.db.autoPodborStep.update({ where: { id }, data });
    return toStep(row);
  }

  async deleteStep(id: string): Promise<void> {
    await this.db.autoPodborStep.delete({ where: { id } });
  }

  /* features */

  async getFeatures(activeOnly = false): Promise<AutoPodborFeature[]> {
    const rows = await this.db.autoPodborFeature.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toFeature);
  }

  async createFeature(data: Omit<AutoPodborFeature, "id">): Promise<AutoPodborFeature> {
    const row = await this.db.autoPodborFeature.create({ data: { ...data } });
    return toFeature(row);
  }

  async updateFeature(id: string, data: Partial<AutoPodborFeature>): Promise<AutoPodborFeature> {
    const row = await this.db.autoPodborFeature.update({ where: { id }, data });
    return toFeature(row);
  }

  async deleteFeature(id: string): Promise<void> {
    await this.db.autoPodborFeature.delete({ where: { id } });
  }

  /* checks */

  async getChecks(activeOnly = false): Promise<AutoPodborCheckItem[]> {
    const rows = await this.db.autoPodborCheckItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toCheck);
  }

  async createCheck(data: Omit<AutoPodborCheckItem, "id">): Promise<AutoPodborCheckItem> {
    const row = await this.db.autoPodborCheckItem.create({ data: { ...data } });
    return toCheck(row);
  }

  async updateCheck(id: string, data: Partial<AutoPodborCheckItem>): Promise<AutoPodborCheckItem> {
    const row = await this.db.autoPodborCheckItem.update({ where: { id }, data });
    return toCheck(row);
  }

  async deleteCheck(id: string): Promise<void> {
    await this.db.autoPodborCheckItem.delete({ where: { id } });
  }

  /* cases */

  async getCases(activeOnly = false): Promise<AutoPodborCase[]> {
    const rows = await this.db.autoPodborCase.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toCase);
  }

  async createCase(data: Omit<AutoPodborCase, "id">): Promise<AutoPodborCase> {
    const row = await this.db.autoPodborCase.create({ data: { ...data } });
    return toCase(row);
  }

  async updateCase(id: string, data: Partial<AutoPodborCase>): Promise<AutoPodborCase> {
    const row = await this.db.autoPodborCase.update({ where: { id }, data });
    return toCase(row);
  }

  async deleteCase(id: string): Promise<void> {
    await this.db.autoPodborCase.delete({ where: { id } });
  }

  /* reviews */

  async getReviews(activeOnly = false): Promise<AutoPodborReview[]> {
    const rows = await this.db.autoPodborReview.findMany({
      where: activeOnly ? { isPublished: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toReview);
  }

  async createReview(data: Omit<AutoPodborReview, "id">): Promise<AutoPodborReview> {
    const row = await this.db.autoPodborReview.create({ data: { ...data } });
    return toReview(row);
  }

  async updateReview(id: string, data: Partial<AutoPodborReview>): Promise<AutoPodborReview> {
    const row = await this.db.autoPodborReview.update({ where: { id }, data });
    return toReview(row);
  }

  async deleteReview(id: string): Promise<void> {
    await this.db.autoPodborReview.delete({ where: { id } });
  }

  /* faq */

  async getFaq(activeOnly = false): Promise<AutoPodborFaq[]> {
    const rows = await this.db.autoPodborFaq.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toFaq);
  }

  async createFaq(data: Omit<AutoPodborFaq, "id">): Promise<AutoPodborFaq> {
    const row = await this.db.autoPodborFaq.create({ data: { ...data } });
    return toFaq(row);
  }

  async updateFaq(id: string, data: Partial<AutoPodborFaq>): Promise<AutoPodborFaq> {
    const row = await this.db.autoPodborFaq.update({ where: { id }, data });
    return toFaq(row);
  }

  async deleteFaq(id: string): Promise<void> {
    await this.db.autoPodborFaq.delete({ where: { id } });
  }

  /* gallery */

  async getGallery(activeOnly = false): Promise<AutoPodborGalleryItem[]> {
    const rows = await this.db.autoPodborGalleryItem.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toGallery);
  }

  async createGalleryItem(data: Omit<AutoPodborGalleryItem, "id">): Promise<AutoPodborGalleryItem> {
    const row = await this.db.autoPodborGalleryItem.create({ data: { ...data } });
    return toGallery(row);
  }

  async updateGalleryItem(id: string, data: Partial<AutoPodborGalleryItem>): Promise<AutoPodborGalleryItem> {
    const row = await this.db.autoPodborGalleryItem.update({ where: { id }, data });
    return toGallery(row);
  }

  async deleteGalleryItem(id: string): Promise<void> {
    await this.db.autoPodborGalleryItem.delete({ where: { id } });
  }

  /* cities */

  async getCities(activeOnly = false): Promise<AutoPodborCity[]> {
    const rows = await this.db.autoPodborCity.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.map(toCity);
  }

  async createCity(data: Omit<AutoPodborCity, "id">): Promise<AutoPodborCity> {
    const row = await this.db.autoPodborCity.create({ data: { ...data } });
    return toCity(row);
  }

  async updateCity(id: string, data: Partial<AutoPodborCity>): Promise<AutoPodborCity> {
    const row = await this.db.autoPodborCity.update({ where: { id }, data });
    return toCity(row);
  }

  async deleteCity(id: string): Promise<void> {
    await this.db.autoPodborCity.delete({ where: { id } });
  }

  /* promos */

  async getPromos(activeOnly = false): Promise<AutoPodborPromo[]> {
    const rows = await this.db.autoPodborPromo.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return rows.map(toPromo);
  }

  async createPromo(data: Omit<AutoPodborPromo, "id">): Promise<AutoPodborPromo> {
    const row = await this.db.autoPodborPromo.create({ data: { ...data } });
    return toPromo(row);
  }

  async updatePromo(id: string, data: Partial<AutoPodborPromo>): Promise<AutoPodborPromo> {
    const row = await this.db.autoPodborPromo.update({ where: { id }, data });
    return toPromo(row);
  }

  async deletePromo(id: string): Promise<void> {
    await this.db.autoPodborPromo.delete({ where: { id } });
  }

  /* aggregate */

  async getPublicData(): Promise<AutoPodborPublicData> {
    const [settings, sections, tariffs, steps, features, checks, cases, reviews, faq, cities, gallery, promos] =
      await Promise.all([
        this.getSettings(),
        this.getSections(true),
        this.getTariffs(true),
        this.getSteps(true),
        this.getFeatures(true),
        this.getChecks(true),
        this.getCases(true),
        this.getReviews(true),
        this.getFaq(true),
        this.getCities(true),
        this.getGallery(true),
        this.getPromos(true),
      ]);
    return { settings, sections, tariffs, steps, features, checks, cases, reviews, faq, cities, gallery, promos };
  }

  /* leads */

  async createLead(data: NewLead): Promise<AutoPodborLead> {
    const row = await this.db.autoPodborLead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        messenger: data.messenger,
        city: data.city,
        budgetFrom: data.budgetFrom,
        budgetTo: data.budgetTo,
        brand: data.brand,
        model: data.model,
        serviceSlug: data.serviceSlug,
        serviceTitle: data.serviceTitle,
        comment: data.comment,
        quiz: data.quiz,
        source: data.source,
        priceQuoted: data.priceQuoted,
        pageUrl: data.pageUrl,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
      include: LEAD_INCLUDE,
    });
    return toLead(row);
  }

  async getLeads(filters: LeadFilters = {}): Promise<LeadListResult> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 50));

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.serviceSlug) where.serviceSlug = filters.serviceSlug;
    if (filters.city) where.city = filters.city;
    if (filters.search) {
      const q = filters.search.trim();
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q } },
          { brand: { contains: q } },
          { model: { contains: q } },
        ];
      }
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: new Date(`${filters.dateFrom}T00:00:00.000Z`) } : {}),
        ...(filters.dateTo ? { lte: new Date(`${filters.dateTo}T23:59:59.999Z`) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      this.db.autoPodborLead.findMany({
        where,
        include: LEAD_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.autoPodborLead.count({ where }),
    ]);

    return { items: items.map(toLead), total, page, limit };
  }

  async getLead(id: string): Promise<AutoPodborLead | null> {
    const row = await this.db.autoPodborLead.findUnique({ where: { id }, include: LEAD_INCLUDE });
    return row ? toLead(row) : null;
  }

  async updateLead(id: string, data: Partial<AutoPodborLead>): Promise<AutoPodborLead> {
    const row = await this.db.autoPodborLead.update({
      where: { id },
      data: {
        status: data.status,
        assignedToId: data.assignedToId,
        internalNote: data.internalNote,
        priceQuoted: data.priceQuoted,
      },
      include: LEAD_INCLUDE,
    });
    return toLead(row);
  }

  async deleteLead(id: string): Promise<void> {
    await this.db.autoPodborLead.delete({ where: { id } });
  }

  async countNewLeads(): Promise<number> {
    return this.db.autoPodborLead.count({ where: { status: "new" } });
  }

  async getStats(): Promise<AutoPodborStats> {
    const [total, grouped, budgets, latest, topTariff] = await Promise.all([
      this.db.autoPodborLead.count(),
      this.db.autoPodborLead.groupBy({ by: ["status"], _count: { _all: true } }),
      this.db.autoPodborLead.findMany({
        where: { OR: [{ budgetFrom: { not: null } }, { budgetTo: { not: null } }] },
        select: { budgetFrom: true, budgetTo: true },
      }),
      this.db.autoPodborLead.findMany({
        include: LEAD_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      this.db.autoPodborLead.groupBy({
        by: ["serviceTitle"],
        _count: { _all: true },
        orderBy: { _count: { serviceTitle: "desc" } },
        take: 1,
      }),
    ]);

    const byStatus = new Map<string, number>();
    for (const g of grouped) byStatus.set(g.status, g._count._all);

    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - 13);
    const recent = await this.db.autoPodborLead.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    });
    const counts = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setUTCDate(since.getUTCDate() + i);
      counts.set(d.toISOString().slice(0, 10), 0);
    }
    for (const r of recent) {
      const key = (r.createdAt instanceof Date ? r.createdAt : new Date(r.createdAt)).toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const done = byStatus.get("done") ?? 0;
    const avgBudget = budgets.length > 0
      ? Math.round(budgets.reduce((sum, lead) => sum + (lead.budgetFrom ?? lead.budgetTo ?? 0), 0) / budgets.length)
      : 0;

    return {
      total,
      newCount: byStatus.get("new") ?? 0,
      inWork: (byStatus.get("in_progress") ?? 0) + (byStatus.get("contacted") ?? 0) + (byStatus.get("options_sent") ?? 0) + (byStatus.get("meeting") ?? 0),
      done,
      cancelled: (byStatus.get("cancelled") ?? 0) + (byStatus.get("spam") ?? 0),
      conversion: total > 0 ? Math.round((done / total) * 100) : 0,
      avgBudget,
      topTariff: topTariff[0]?.serviceTitle
        ? { title: topTariff[0].serviceTitle, count: topTariff[0]._count._all }
        : undefined,
      byDay: [...counts.entries()].map(([date, count]) => ({ date, count })),
      latest: latest.map(toLead),
    };
  }
}
