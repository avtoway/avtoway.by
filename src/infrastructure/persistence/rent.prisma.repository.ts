import { getPrismaClient } from "./prisma.client";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCar, RentType } from "@/entities/rent/rent-car.types";
import { randomUUID } from "node:crypto";

function toRentCar(row: any): RentCar {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brandId: row.brandId ?? undefined,
    modelId: row.modelId ?? undefined,
    brand: row.brandRel?.name ?? undefined,
    model: row.modelRel?.name ?? undefined,
    year: row.year ?? undefined,
    color: row.color ?? undefined,
    transmission: row.transmission ?? undefined,
    fuel: row.fuel ?? undefined,
    engineVolume: row.engineVolume ?? undefined,
    seats: row.seats ?? undefined,
    features: row.features ?? undefined,
    photos: row.photos ?? undefined,
    mainPhoto: row.mainPhoto ?? undefined,
    description: row.description ?? undefined,
    priceDay: row.priceDay ?? undefined,
    price3Days: row.price3Days ?? undefined,
    price7Days: row.price7Days ?? undefined,
    priceMonth: row.priceMonth ?? undefined,
    priceDayTaxi: row.priceDayTaxi ?? undefined,
    rentTypeId: row.rentTypeId ?? undefined,
    rentType: row.rentType ? { id: row.rentType.id, name: row.rentType.name, slug: row.rentType.slug } : undefined,
    isActive: row.isActive,
    bookedUntil: row.bookedUntil ?? undefined,
    sortOrder: row.sortOrder,
  };
}

function toRentType(row: any): RentType {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sortOrder,
  };
}

export class PrismaRentCarRepository implements RentCarRepository {
  private get db() { return getPrismaClient(); }

  async getAll(filters?: { rentTypeSlug?: string; showAll?: boolean }): Promise<RentCar[]> {
    const where: Record<string, unknown> = filters?.showAll ? {} : { isActive: true };
    if (filters?.rentTypeSlug) {
      where.rentType = { slug: filters.rentTypeSlug };
    }
    const rows = await this.db.rentCar.findMany({
      where: where as any,
      include: { rentType: true, brandRel: true, modelRel: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toRentCar);
  }

  async getBySlug(slug: string): Promise<RentCar | null> {
    const row = await this.db.rentCar.findUnique({
      where: { slug },
      include: { rentType: true, brandRel: true, modelRel: true },
    });
    return row ? toRentCar(row) : null;
  }

  async getTypes(): Promise<RentType[]> {
    const rows = await this.db.rentType.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map(toRentType);
  }

  async create(data: Omit<RentCar, "id" | "rentType">): Promise<RentCar> {
    const row = await this.db.rentCar.create({
      data: {
        id: randomUUID(),
        name: data.name, slug: data.slug,
        brandId: data.brandId ?? null, modelId: data.modelId ?? null,
        year: data.year ?? null, color: data.color ?? null,
        transmission: data.transmission ?? null, fuel: data.fuel ?? null,
        engineVolume: data.engineVolume ?? null, seats: data.seats ?? null,
        features: data.features ?? null,
        photos: data.photos ?? null, mainPhoto: data.mainPhoto ?? null,
        description: data.description ?? null,
        priceDay: data.priceDay ?? null, price3Days: data.price3Days ?? null,
        price7Days: data.price7Days ?? null, priceMonth: data.priceMonth ?? null,
        priceDayTaxi: data.priceDayTaxi ?? null,
        rentTypeId: data.rentTypeId ?? null,
        isActive: data.isActive ?? true,
        bookedUntil: data.bookedUntil ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { rentType: true, brandRel: true, modelRel: true },
    });
    return toRentCar(row);
  }

  async update(id: string, data: Partial<RentCar>): Promise<RentCar> {
    const row = await this.db.rentCar.update({
      where: { id },
      data: {
        name: data.name, slug: data.slug,
        brandId: data.brandId, modelId: data.modelId,
        year: data.year, color: data.color,
        transmission: data.transmission, fuel: data.fuel,
        engineVolume: data.engineVolume, seats: data.seats,
        features: data.features,
        photos: data.photos, mainPhoto: data.mainPhoto,
        description: data.description,
        priceDay: data.priceDay, price3Days: data.price3Days,
        price7Days: data.price7Days, priceMonth: data.priceMonth,
        priceDayTaxi: data.priceDayTaxi,
        rentTypeId: data.rentTypeId,
        isActive: data.isActive,
        bookedUntil: data.bookedUntil,
        sortOrder: data.sortOrder,
      },
      include: { rentType: true, brandRel: true, modelRel: true },
    });
    return toRentCar(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.rentCar.delete({ where: { id } });
  }
}
