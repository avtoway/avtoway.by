import { getPrismaClient } from "./prisma.client";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";
import type { RentCar, RentType, CarClass, RentExtra, RentRequest } from "@/entities/rent/rent-car.types";
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
    classId: row.classId ?? undefined,
    class: row.classRel?.name ?? undefined,
    classDeposit: row.classRel?.deposit ?? undefined,
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

function toCarClass(row: any): CarClass {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sortOrder,
    deposit: row.deposit ?? undefined,
    minAge: row.minAge ?? undefined,
  };
}

function toRentExtra(row: any): RentExtra {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    priceType: row.priceType ?? "perDay",
    price: row.price,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

function toRentRequest(row: any): RentRequest {
  return {
    id: row.id,
    carId: row.carId ?? undefined,
    car: row.car ? { id: row.car.id, name: row.car.name, slug: row.car.slug } : undefined,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    days: row.days ?? undefined,
    extras: row.extras ?? undefined,
    total: row.total ?? undefined,
    deposit: row.deposit ?? undefined,
    status: row.status,
    message: row.message ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  };
}

export class PrismaRentCarRepository implements RentCarRepository {
  private get db() { return getPrismaClient(); }

  async getAll(filters?: { rentTypeSlug?: string; classSlug?: string; showAll?: boolean }): Promise<RentCar[]> {
    const where: Record<string, unknown> = filters?.showAll ? {} : { isActive: true };
    if (filters?.rentTypeSlug) {
      where.rentType = { slug: filters.rentTypeSlug };
    }
    if (filters?.classSlug) {
      where.classRel = { slug: filters.classSlug };
    }
    const rows = await this.db.rentCar.findMany({
      where: where as any,
      include: { rentType: true, brandRel: true, modelRel: true, classRel: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toRentCar);
  }

  async getBySlug(slug: string): Promise<RentCar | null> {
    const row = await this.db.rentCar.findUnique({
      where: { slug },
      include: { rentType: true, brandRel: true, modelRel: true, classRel: true },
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
        classId: data.classId ?? null,
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
      include: { rentType: true, brandRel: true, modelRel: true, classRel: true },
    });
    return toRentCar(row);
  }

  async update(id: string, data: Partial<RentCar>): Promise<RentCar> {
    const row = await this.db.rentCar.update({
      where: { id },
      data: {
        name: data.name, slug: data.slug,
        brandId: data.brandId, modelId: data.modelId,
        classId: data.classId,
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
      include: { rentType: true, brandRel: true, modelRel: true, classRel: true },
    });
    return toRentCar(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.rentCar.delete({ where: { id } });
  }

  /* ─── Classes ─── */

  async getClasses(): Promise<CarClass[]> {
    const rows = await this.db.carClass.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map(toCarClass);
  }

  async createClass(data: Omit<CarClass, "id">): Promise<CarClass> {
    const row = await this.db.carClass.create({
      data: {
        name: data.name, slug: data.slug,
        sortOrder: data.sortOrder ?? 0,
        deposit: data.deposit ?? null,
        minAge: data.minAge ?? null,
      },
    });
    return toCarClass(row);
  }

  async updateClass(id: string, data: Partial<CarClass>): Promise<CarClass> {
    const row = await this.db.carClass.update({
      where: { id },
      data: {
        name: data.name, slug: data.slug,
        sortOrder: data.sortOrder,
        deposit: data.deposit,
        minAge: data.minAge,
      },
    });
    return toCarClass(row);
  }

  async deleteClass(id: string): Promise<void> {
    await this.db.carClass.delete({ where: { id } });
  }

  /* ─── Extras ─── */

  async getExtras(showAll = false): Promise<RentExtra[]> {
    const rows = await this.db.rentExtra.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(toRentExtra);
  }

  async createExtra(data: Omit<RentExtra, "id">): Promise<RentExtra> {
    const row = await this.db.rentExtra.create({
      data: {
        name: data.name, slug: data.slug,
        description: data.description ?? null,
        priceType: data.priceType ?? "perDay",
        price: data.price ?? 0,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return toRentExtra(row);
  }

  async updateExtra(id: string, data: Partial<RentExtra>): Promise<RentExtra> {
    const row = await this.db.rentExtra.update({
      where: { id },
      data: {
        name: data.name, slug: data.slug,
        description: data.description,
        priceType: data.priceType,
        price: data.price,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
    });
    return toRentExtra(row);
  }

  async deleteExtra(id: string): Promise<void> {
    await this.db.rentExtra.delete({ where: { id } });
  }

  /* ─── Rental requests ─── */

  async createRentRequest(data: Omit<RentRequest, "id" | "createdAt" | "status">): Promise<RentRequest> {
    const row = await this.db.rentRequest.create({
      data: {
        carId: data.carId ?? null,
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        days: data.days ?? null,
        extras: data.extras ?? null,
        total: data.total ?? null,
        deposit: data.deposit ?? null,
        message: data.message ?? null,
        status: "new",
      },
      include: { car: true },
    });
    return toRentRequest(row);
  }

  async getRentRequests(): Promise<RentRequest[]> {
    const rows = await this.db.rentRequest.findMany({
      include: { car: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toRentRequest);
  }

  async updateRentRequestStatus(id: string, status: string): Promise<RentRequest> {
    const row = await this.db.rentRequest.update({
      where: { id },
      data: { status },
      include: { car: true },
    });
    return toRentRequest(row);
  }

  async deleteRentRequest(id: string): Promise<void> {
    await this.db.rentRequest.delete({ where: { id } });
  }
}
