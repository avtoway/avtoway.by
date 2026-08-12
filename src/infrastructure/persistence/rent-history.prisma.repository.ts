import { getPrismaClient } from "./prisma.client";
import { randomUUID } from "node:crypto";
import type { RentCarHistoryRepository } from "@/entities/rent/rent-car-history.repository";
import type { RentCarHistory } from "@/entities/rent/rent-car-history.types";

function toHistory(row: any): RentCarHistory {
  return {
    id: row.id,
    carId: row.carId,
    type: row.type,
    description: row.description ?? undefined,
    amount: row.amount ?? undefined,
    date: row.date,
    createdAt: row.createdAt.toString(),
  };
}

export class PrismaRentCarHistoryRepository implements RentCarHistoryRepository {
  private get db() { return getPrismaClient(); }

  async getByCarId(carId: string): Promise<RentCarHistory[]> {
    const rows = await this.db.rentCarHistory.findMany({
      where: { carId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toHistory);
  }

  async create(data: Omit<RentCarHistory, "id" | "createdAt">): Promise<RentCarHistory> {
    const row = await this.db.rentCarHistory.create({
      data: {
        id: randomUUID(),
        carId: data.carId,
        type: data.type,
        description: data.description ?? null,
        amount: data.amount ?? null,
        date: data.date,
      },
    });
    return toHistory(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.rentCarHistory.delete({ where: { id } });
  }
}
