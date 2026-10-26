import { getPrismaClient } from "./prisma.client";
import type { ContactRepository } from "@/entities/contact/contact.repository";
import type { ContactRequest, ContactRequestStatus } from "@/entities/contact/contact";

function toContactRequest(r: any): ContactRequest {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    message: r.message,
    status: r.status,
    createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
  };
}

export class PrismaContactRequestRepository implements ContactRepository {
  async create(data: { name: string; phone?: string; email?: string; message: string }): Promise<ContactRequest> {
    const db = getPrismaClient();
    const record = await db.contactRequest.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        message: data.message,
      },
    });
    return toContactRequest(record);
  }

  async getAll(): Promise<ContactRequest[]> {
    const db = getPrismaClient();
    const records = await db.contactRequest.findMany({ orderBy: { createdAt: "desc" } });
    return records.map(toContactRequest);
  }

  async updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequest> {
    const db = getPrismaClient();
    const record = await db.contactRequest.update({ where: { id }, data: { status } });
    return toContactRequest(record);
  }

  async delete(id: string): Promise<void> {
    const db = getPrismaClient();
    await db.contactRequest.delete({ where: { id } });
  }
}
