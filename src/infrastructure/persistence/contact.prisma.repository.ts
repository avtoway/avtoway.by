import { getPrismaClient } from "./prisma.client";
import { randomUUID } from "node:crypto";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { ContactInfo } from "@/entities/contact/contact-info.types";

function toContactInfo(row: any): ContactInfo {
  return {
    id: row.id,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    telegram: row.telegram ?? undefined,
    viber: row.viber ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    instagram: row.instagram ?? undefined,
    youtube: row.youtube ?? undefined,
    rutube: row.rutube ?? undefined,
    vk: row.vk ?? undefined,
    address: row.address ?? undefined,
    workingHours: row.workingHours ?? undefined,
  };
}

export class PrismaContactInfoRepository implements ContactInfoRepository {
  private get db() { return getPrismaClient(); }

  async get(): Promise<ContactInfo | null> {
    const row = await this.db.contact.findFirst();
    return row ? toContactInfo(row) : null;
  }

  async update(data: Partial<ContactInfo>): Promise<ContactInfo> {
    let row = await this.db.contact.findFirst();
    const updateData: Record<string, unknown> = {};
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.telegram !== undefined) updateData.telegram = data.telegram;
    if (data.viber !== undefined) updateData.viber = data.viber;
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.youtube !== undefined) updateData.youtube = data.youtube;
    if (data.rutube !== undefined) updateData.rutube = data.rutube;
    if (data.vk !== undefined) updateData.vk = data.vk;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.workingHours !== undefined) updateData.workingHours = data.workingHours;

    if (!row) {
      row = await this.db.contact.create({
        data: { id: randomUUID(), ...updateData as any },
      });
    } else {
      row = await this.db.contact.update({
        where: { id: row.id },
        data: updateData as any,
      });
    }
    return toContactInfo(row);
  }
}
