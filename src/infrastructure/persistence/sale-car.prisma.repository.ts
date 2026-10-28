import { getPrismaClient } from "./prisma.client";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";
import type {
  CustomSpec,
  SaleCar,
  SaleCarFilters,
  SaleCarInput,
  SaleRequest,
  SaleRequestInput,
} from "@/entities/sell/sale-car.types";

function parseStrings(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return value.split(",").map(v => v.trim()).filter(Boolean);
  }
}

function parseSpecs(value: string | null | undefined): CustomSpec[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is { label: string; value: string } =>
        Boolean(v) && typeof v.label === "string" && typeof v.value === "string",
      )
      .map(v => ({ label: v.label, value: v.value }));
  } catch {
    return [];
  }
}

function toSaleCar(row: any): SaleCar {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    brandId: row.brandId ?? undefined,
    modelId: row.modelId ?? undefined,
    brand: row.brandRel?.name ?? undefined,
    model: row.modelRel?.name ?? undefined,
    brandSlug: row.brandRel?.slug ?? undefined,
    modelSlug: row.modelRel?.slug ?? undefined,
    generation: row.generation ?? undefined,
    priceUsd: row.priceUsd,
    priceByn: row.priceByn ?? undefined,
    oldPriceUsd: row.oldPriceUsd ?? undefined,
    isNegotiable: row.isNegotiable,
    allowExchange: row.allowExchange,
    allowCredit: row.allowCredit,
    year: row.year,
    mileageKm: row.mileageKm,
    bodyType: row.bodyType,
    transmission: row.transmission,
    fuel: row.fuel,
    engineVolume: row.engineVolume ?? undefined,
    enginePowerHp: row.enginePowerHp ?? undefined,
    driveType: row.driveType,
    color: row.color ?? undefined,
    interiorMaterial: row.interiorMaterial ?? undefined,
    interiorColor: row.interiorColor ?? undefined,
    steering: row.steering ?? "left",
    seats: row.seats ?? undefined,
    doors: row.doors ?? undefined,
    condition: row.condition ?? "used",
    ownersCount: row.ownersCount ?? undefined,
    originCountry: row.originCountry ?? undefined,
    customsCleared: row.customsCleared,
    vin: row.vin ?? undefined,
    vinVerified: row.vinVerified,
    originalPaint: row.originalPaint,
    noAccidents: row.noAccidents,
    serviceBook: row.serviceBook,
    isInspected: row.isInspected,
    expertSummary: row.expertSummary ?? undefined,
    bodyCheckNote: row.bodyCheckNote ?? undefined,
    techCheckNote: row.techCheckNote ?? undefined,
    legalCheckNote: row.legalCheckNote ?? undefined,
    diagnosticsPdf: row.diagnosticsPdf ?? undefined,
    features: parseStrings(row.features),
    customSpecs: parseSpecs(row.customSpecs),
    description: row.description ?? undefined,
    mainPhoto: row.mainPhoto ?? undefined,
    photos: parseStrings(row.photos),
    videoUrl: row.videoUrl ?? undefined,
    city: row.city ?? "Минск",
    contactName: row.contactName ?? undefined,
    contactPhone: row.contactPhone ?? undefined,
    status: row.status ?? "available",
    isFeatured: row.isFeatured,
    isActive: row.isActive,
    viewsCount: row.viewsCount ?? 0,
    sortOrder: row.sortOrder ?? 0,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

function toRequest(row: any): SaleRequest {
  return {
    id: row.id,
    type: row.type,
    carId: row.carId ?? undefined,
    car: row.car
      ? {
          id: row.car.id,
          title: row.car.title,
          slug: row.car.slug,
          mainPhoto: row.car.mainPhoto ?? undefined,
          priceUsd: row.car.priceUsd,
        }
      : undefined,
    clientName: row.clientName,
    clientPhone: row.clientPhone,
    carInfo: row.carInfo ?? undefined,
    offerPrice: row.offerPrice ?? undefined,
    comment: row.comment ?? undefined,
    status: row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt),
  };
}

function sortBy(sort?: string) {
  switch (sort) {
    case "fresh":
      return [{ createdAt: "desc" as const }];
    case "price_asc":
      return [{ priceUsd: "asc" as const }];
    case "price_desc":
      return [{ priceUsd: "desc" as const }];
    case "mileage_asc":
      return [{ mileageKm: "asc" as const }];
    case "year_desc":
      return [{ year: "desc" as const }];
    default:
      return [{ isFeatured: "desc" as const }, { sortOrder: "asc" as const }, { createdAt: "desc" as const }];
  }
}

export class PrismaSaleCarRepository implements SaleCarRepository {
  private get db() {
    return getPrismaClient();
  }

  async getAll(filters?: SaleCarFilters): Promise<SaleCar[]> {
    const where: Record<string, unknown> = {};

    if (!filters?.showAll) {
      where.isActive = true;
      where.status = { not: "draft" };
    }
    if (filters?.status) where.status = filters.status;
    else if (filters?.hideSold) where.status = { not: "sold" };
    if (filters?.featured) where.isFeatured = true;
    if (filters?.brandSlug) where.brandRel = { slug: filters.brandSlug };
    if (filters?.modelSlug) where.modelRel = { slug: filters.modelSlug };
    if (filters?.generation) where.generation = { contains: filters.generation };
    if (filters?.transmission) where.transmission = filters.transmission;
    if (filters?.fuel) where.fuel = filters.fuel;
    if (filters?.driveType) where.driveType = filters.driveType;
    if (filters?.bodyTypes?.length) where.bodyType = { in: filters.bodyTypes };
    if (filters?.inspected) where.isInspected = true;
    if (filters?.originalPaint) where.originalPaint = true;
    if (filters?.noAccidents) where.noAccidents = true;
    if (filters?.allowExchange) where.allowExchange = true;
    if (filters?.mileageMax != null) where.mileageKm = { lte: filters.mileageMax };
    if (filters?.yearMin != null || filters?.yearMax != null) {
      where.year = {
        ...(filters.yearMin != null ? { gte: filters.yearMin } : {}),
        ...(filters.yearMax != null ? { lte: filters.yearMax } : {}),
      };
    }
    if (filters?.priceMin != null || filters?.priceMax != null) {
      where.priceUsd = {
        ...(filters.priceMin != null ? { gte: filters.priceMin } : {}),
        ...(filters.priceMax != null ? { lte: filters.priceMax } : {}),
      };
    }
    if (filters?.engineMin != null || filters?.engineMax != null) {
      where.engineVolume = {
        ...(filters.engineMin != null ? { gte: filters.engineMin } : {}),
        ...(filters.engineMax != null ? { lte: filters.engineMax } : {}),
      };
    }
    if (filters?.search) {
      const q = filters.search;
      where.OR = [
        { title: { contains: q } },
        { vin: { contains: q } },
        { brandRel: { name: { contains: q } } },
        { modelRel: { name: { contains: q } } },
      ];
    }

    const rows = await this.db.saleCar.findMany({
      where: where as any,
      include: { brandRel: true, modelRel: true },
      orderBy: sortBy(filters?.sort),
      take: filters?.limit,
    });
    return rows.map(toSaleCar);
  }

  async getBySlug(slug: string): Promise<SaleCar | null> {
    const row = await this.db.saleCar.findUnique({
      where: { slug },
      include: { brandRel: true, modelRel: true },
    });
    return row ? toSaleCar(row) : null;
  }

  async getById(id: string): Promise<SaleCar | null> {
    const row = await this.db.saleCar.findUnique({
      where: { id },
      include: { brandRel: true, modelRel: true },
    });
    return row ? toSaleCar(row) : null;
  }

  async create(data: SaleCarInput): Promise<SaleCar> {
    const row = await this.db.saleCar.create({
      data: {
        title: data.title,
        slug: data.slug,
        brandId: data.brandId || null,
        modelId: data.modelId || null,
        generation: data.generation || null,
        priceUsd: data.priceUsd,
        priceByn: data.priceByn ?? null,
        oldPriceUsd: data.oldPriceUsd ?? null,
        isNegotiable: data.isNegotiable ?? true,
        allowExchange: data.allowExchange ?? false,
        allowCredit: data.allowCredit ?? false,
        year: data.year,
        mileageKm: data.mileageKm,
        bodyType: data.bodyType,
        transmission: data.transmission,
        fuel: data.fuel,
        engineVolume: data.engineVolume ?? null,
        enginePowerHp: data.enginePowerHp ?? null,
        driveType: data.driveType,
        color: data.color || null,
        interiorMaterial: data.interiorMaterial || null,
        interiorColor: data.interiorColor || null,
        steering: data.steering ?? "left",
        seats: data.seats ?? 5,
        doors: data.doors ?? 4,
        condition: data.condition ?? "used",
        ownersCount: data.ownersCount || null,
        originCountry: data.originCountry || null,
        customsCleared: data.customsCleared ?? true,
        vin: data.vin || null,
        vinVerified: data.vinVerified ?? false,
        originalPaint: data.originalPaint ?? false,
        noAccidents: data.noAccidents ?? false,
        serviceBook: data.serviceBook ?? false,
        isInspected: data.isInspected ?? true,
        expertSummary: data.expertSummary || null,
        bodyCheckNote: data.bodyCheckNote || null,
        techCheckNote: data.techCheckNote || null,
        legalCheckNote: data.legalCheckNote || null,
        diagnosticsPdf: data.diagnosticsPdf || null,
        features: JSON.stringify(data.features ?? []),
        customSpecs: JSON.stringify(data.customSpecs ?? []),
        description: data.description || null,
        mainPhoto: data.mainPhoto || data.photos?.[0] || null,
        photos: JSON.stringify(data.photos ?? []),
        videoUrl: data.videoUrl || null,
        city: data.city || "Минск",
        contactName: data.contactName || null,
        contactPhone: data.contactPhone || null,
        status: data.status ?? "available",
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
      include: { brandRel: true, modelRel: true },
    });
    return toSaleCar(row);
  }

  async update(id: string, data: Partial<SaleCarInput>): Promise<SaleCar> {
    const update: Record<string, unknown> = {};
    const set = <K extends keyof SaleCarInput>(key: K, value: unknown) => {
      if (data[key] !== undefined) update[key as string] = value;
    };

    set("title", data.title);
    set("slug", data.slug);
    set("brandId", data.brandId || null);
    set("modelId", data.modelId || null);
    set("generation", data.generation || null);
    set("priceUsd", data.priceUsd);
    set("priceByn", data.priceByn ?? null);
    set("oldPriceUsd", data.oldPriceUsd ?? null);
    set("isNegotiable", data.isNegotiable);
    set("allowExchange", data.allowExchange);
    set("allowCredit", data.allowCredit);
    set("year", data.year);
    set("mileageKm", data.mileageKm);
    set("bodyType", data.bodyType);
    set("transmission", data.transmission);
    set("fuel", data.fuel);
    set("engineVolume", data.engineVolume ?? null);
    set("enginePowerHp", data.enginePowerHp ?? null);
    set("driveType", data.driveType);
    set("color", data.color || null);
    set("interiorMaterial", data.interiorMaterial || null);
    set("interiorColor", data.interiorColor || null);
    set("steering", data.steering);
    set("seats", data.seats ?? null);
    set("doors", data.doors ?? null);
    set("condition", data.condition);
    set("ownersCount", data.ownersCount || null);
    set("originCountry", data.originCountry || null);
    set("customsCleared", data.customsCleared);
    set("vin", data.vin || null);
    set("vinVerified", data.vinVerified);
    set("originalPaint", data.originalPaint);
    set("noAccidents", data.noAccidents);
    set("serviceBook", data.serviceBook);
    set("isInspected", data.isInspected);
    set("expertSummary", data.expertSummary || null);
    set("bodyCheckNote", data.bodyCheckNote || null);
    set("techCheckNote", data.techCheckNote || null);
    set("legalCheckNote", data.legalCheckNote || null);
    set("diagnosticsPdf", data.diagnosticsPdf || null);
    set("features", data.features !== undefined ? JSON.stringify(data.features) : undefined);
    set("customSpecs", data.customSpecs !== undefined ? JSON.stringify(data.customSpecs) : undefined);
    set("description", data.description || null);
    set("mainPhoto", data.mainPhoto !== undefined ? data.mainPhoto || null : undefined);
    set("photos", data.photos !== undefined ? JSON.stringify(data.photos) : undefined);
    set("videoUrl", data.videoUrl || null);
    set("city", data.city);
    set("contactName", data.contactName || null);
    set("contactPhone", data.contactPhone || null);
    set("status", data.status);
    set("isFeatured", data.isFeatured);
    set("isActive", data.isActive);
    set("sortOrder", data.sortOrder);
    set("seoTitle", data.seoTitle || null);
    set("seoDescription", data.seoDescription || null);

    const row = await this.db.saleCar.update({
      where: { id },
      data: update as any,
      include: { brandRel: true, modelRel: true },
    });
    return toSaleCar(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.saleCar.delete({ where: { id } });
  }

  async incrementViews(id: string): Promise<void> {
    await this.db.saleCar.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => undefined);
  }

  async getRequests(filters?: { type?: string; status?: string; search?: string }): Promise<SaleRequest[]> {
    const where: Record<string, unknown> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      const q = filters.search;
      where.OR = [
        { clientName: { contains: q } },
        { clientPhone: { contains: q } },
        { carInfo: { contains: q } },
        { car: { title: { contains: q } } },
      ];
    }
    const rows = await this.db.saleRequest.findMany({
      where: where as any,
      include: { car: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toRequest);
  }

  async countNewRequests(): Promise<number> {
    return this.db.saleRequest.count({ where: { status: "new" } });
  }

  async createRequest(data: SaleRequestInput & { status?: string }): Promise<SaleRequest> {
    const row = await this.db.saleRequest.create({
      data: {
        type: data.type,
        carId: data.carId || null,
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        carInfo: data.carInfo || null,
        offerPrice: data.offerPrice ?? null,
        comment: data.comment || null,
        status: data.status ?? "new",
      },
      include: { car: true },
    });
    return toRequest(row);
  }

  async updateRequestStatus(id: string, status: string): Promise<SaleRequest> {
    const row = await this.db.saleRequest.update({
      where: { id },
      data: { status },
      include: { car: true },
    });
    return toRequest(row);
  }

  async deleteRequest(id: string): Promise<void> {
    await this.db.saleRequest.delete({ where: { id } });
  }
}
