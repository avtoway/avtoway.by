import { getPrismaClient } from "./prisma.client";
import type { CrmRepository, LeadTaskFilters } from "@/entities/crm/crm.repository";
import type {
  CrmAssignee,
  CrmClient,
  CrmClientSummary,
  CrmLead,
  LeadMeta,
  LeadNote,
  LeadSource,
  LeadTask,
} from "@/entities/crm/crm.types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function iso(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

export function normalizePhone(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

const SERVICE_LABELS: Record<string, string> = {
  truck: "Эвакуатор",
  import: "Автопригон",
  service: "Автосервис",
  moving: "Грузоперевозки",
  rent: "Аренда",
  sell: "Продажа",
  inspection: "Автоподбор",
  vacancies: "Вакансии",
  contacts: "Контакты",
};

function serviceLabel(slug?: string | null): string | undefined {
  if (!slug) return undefined;
  return SERVICE_LABELS[slug] ?? slug;
}

function toMeta(row: any): LeadMeta {
  return {
    id: row.id,
    source: row.source as LeadSource,
    leadId: row.leadId,
    assignedToId: row.assignedToId ?? undefined,
    rejectionReason: row.rejectionReason ?? undefined,
    nextContactAt: iso(row.nextContactAt),
    internalNote: row.internalNote ?? undefined,
    createdAt: iso(row.createdAt) ?? "",
    updatedAt: iso(row.updatedAt) ?? "",
  };
}

function toNote(row: any): LeadNote {
  return {
    id: row.id,
    source: row.source as LeadSource,
    leadId: row.leadId,
    userId: row.userId ?? undefined,
    author: row.author ?? undefined,
    text: row.text,
    createdAt: iso(row.createdAt) ?? "",
  };
}

function toTask(row: any, leads?: Map<string, CrmLead>): LeadTask {
  const lead = row.leadId && leads ? leads.get(`${row.source}:${row.leadId}`) : undefined;
  return {
    id: row.id,
    source: row.source as LeadSource,
    leadId: row.leadId ?? undefined,
    clientPhone: row.clientPhone ?? undefined,
    title: row.title,
    dueAt: iso(row.dueAt),
    status: row.status,
    assignedToId: row.assignedToId ?? undefined,
    createdById: row.createdById ?? undefined,
    createdAt: iso(row.createdAt) ?? "",
    completedAt: iso(row.completedAt),
    leadName: lead?.name,
    leadPhone: lead?.phone,
  };
}

function mapContact(row: any): CrmLead {
  return {
    source: "contact",
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    summary: row.message,
    status: row.status,
    createdAt: iso(row.createdAt) ?? "",
    serviceLabel: serviceLabel(row.serviceSlug),
  };
}

function mapRent(row: any): CrmLead {
  return {
    source: "rent",
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    summary: row.message ?? [
      row.car?.name,
      row.days ? `${row.days} дн.` : null,
      row.total ? `${row.total} BYN` : null,
    ].filter(Boolean).join(" · "),
    status: row.status,
    createdAt: iso(row.createdAt) ?? "",
    serviceLabel: row.car?.name ?? "Аренда",
    href: "/admin/rent",
  };
}

function mapSale(row: any): CrmLead {
  return {
    source: "sale",
    id: row.id,
    name: row.clientName,
    phone: row.clientPhone ?? undefined,
    summary: [row.type, row.car?.title ?? row.carInfo, row.comment].filter(Boolean).join(" · "),
    status: row.status,
    createdAt: iso(row.createdAt) ?? "",
    serviceLabel: row.car?.title ?? row.carInfo ?? "Продажа авто",
    href: "/admin/sell",
  };
}

function mapAuto(row: any): CrmLead {
  return {
    source: "autopodbor",
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    summary: [row.brand, row.model, row.city, row.comment].filter(Boolean).join(" · "),
    status: row.status,
    createdAt: iso(row.createdAt) ?? "",
    serviceLabel: row.serviceTitle ?? "Автоподбор",
    href: "/admin/inspection",
  };
}

export class PrismaCrmRepository implements CrmRepository {
  private async getAllLeads(): Promise<CrmLead[]> {
    const db = getPrismaClient();
    const [contacts, rents, sales, autos] = await Promise.all([
      db.contactRequest.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
      db.rentRequest.findMany({
        include: { car: { select: { name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      db.saleRequest.findMany({
        include: { car: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        take: 1000,
      }),
      db.autoPodborLead.findMany({ orderBy: { createdAt: "desc" }, take: 1000 }),
    ]);

    return [
      ...contacts.map(mapContact),
      ...rents.map(mapRent),
      ...sales.map(mapSale),
      ...autos.map(mapAuto),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMeta(source: LeadSource, leadId: string): Promise<LeadMeta | null> {
    const row = await getPrismaClient().leadMeta.findUnique({
      where: { source_leadId: { source, leadId } },
    });
    return row ? toMeta(row) : null;
  }

  async upsertMeta(source: LeadSource, leadId: string, data: {
    assignedToId?: string | null;
    rejectionReason?: string | null;
    nextContactAt?: string | null;
    internalNote?: string | null;
  }): Promise<LeadMeta> {
    const row = await getPrismaClient().leadMeta.upsert({
      where: { source_leadId: { source, leadId } },
      update: {
        assignedToId: data.assignedToId ?? null,
        rejectionReason: data.rejectionReason ?? null,
        nextContactAt: data.nextContactAt ? new Date(data.nextContactAt) : null,
        internalNote: data.internalNote ?? null,
      },
      create: {
        source,
        leadId,
        assignedToId: data.assignedToId ?? null,
        rejectionReason: data.rejectionReason ?? null,
        nextContactAt: data.nextContactAt ? new Date(data.nextContactAt) : null,
        internalNote: data.internalNote ?? null,
      },
    });
    return toMeta(row);
  }

  async getNotes(source: LeadSource, leadId: string): Promise<LeadNote[]> {
    const rows = await getPrismaClient().leadNote.findMany({
      where: { source, leadId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return rows.map(toNote);
  }

  async addNote(source: LeadSource, leadId: string, text: string, userId?: string, author?: string): Promise<LeadNote> {
    const row = await getPrismaClient().leadNote.create({
      data: { source, leadId, text, userId: userId ?? null, author: author ?? null },
    });
    return toNote(row);
  }

  async getTasks(filters: LeadTaskFilters = {}): Promise<LeadTask[]> {
    const db = getPrismaClient();
    const rows = await db.leadTask.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
    const leads = new Map((await this.getAllLeads()).map(lead => [`${lead.source}:${lead.id}`, lead]));

    return rows
      .map(row => toTask(row, leads))
      .filter(task => {
        if (filters.status && task.status !== filters.status) return false;
        if (filters.source && task.source !== filters.source) return false;
        if (filters.leadId && task.leadId !== filters.leadId) return false;
        if (filters.clientPhone && normalizePhone(task.clientPhone) !== normalizePhone(filters.clientPhone)) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "open" ? -1 : 1;
        if (a.dueAt && b.dueAt) return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        if (a.dueAt) return -1;
        if (b.dueAt) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  async createTask(data: {
    source: LeadSource;
    leadId?: string;
    clientPhone?: string;
    title: string;
    dueAt?: string;
    assignedToId?: string;
    createdById?: string;
  }): Promise<LeadTask> {
    const row = await getPrismaClient().leadTask.create({
      data: {
        source: data.source,
        leadId: data.leadId ?? null,
        clientPhone: data.clientPhone ?? null,
        title: data.title,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        assignedToId: data.assignedToId ?? null,
        createdById: data.createdById ?? null,
      },
    });
    return toTask(row);
  }

  async updateTask(id: string, data: { status?: string; title?: string; dueAt?: string | null; assignedToId?: string | null }): Promise<LeadTask> {
    const row = await getPrismaClient().leadTask.update({
      where: { id },
      data: {
        status: data.status,
        title: data.title,
        dueAt: data.dueAt === undefined ? undefined : data.dueAt ? new Date(data.dueAt) : null,
        assignedToId: data.assignedToId,
        completedAt: data.status === "done" ? new Date() : data.status === "open" ? null : undefined,
      },
    });
    return toTask(row);
  }

  async deleteTask(id: string): Promise<void> {
    await getPrismaClient().leadTask.delete({ where: { id } });
  }

  async getClients(search?: string): Promise<CrmClientSummary[]> {
    const leads = await this.getAllLeads();
    const map = new Map<string, CrmClientSummary>();

    for (const lead of leads) {
      const phone = normalizePhone(lead.phone);
      if (!phone) continue;
      const existing = map.get(phone);
      if (existing) {
        existing.total += 1;
        existing.newCount += lead.status === "new" ? 1 : 0;
        existing.sources = [...new Set([...existing.sources, lead.source])];
        if (new Date(lead.createdAt).getTime() > new Date(existing.lastAt).getTime()) existing.lastAt = lead.createdAt;
        if (lead.email && !existing.email) existing.email = lead.email;
      } else {
        map.set(phone, {
          phone,
          name: lead.name,
          email: lead.email,
          total: 1,
          newCount: lead.status === "new" ? 1 : 0,
          sources: [lead.source],
          lastAt: lead.createdAt,
        });
      }
    }

    const items = [...map.values()].sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
    if (!search) return items.slice(0, 200);
    const query = search.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.phone.includes(query.replace(/\D/g, "")) ||
      item.email?.toLowerCase().includes(query),
    );
  }

  async getClient(phone: string): Promise<CrmClient | null> {
    const normalized = normalizePhone(phone);
    if (!normalized) return null;
    const leads = (await this.getAllLeads()).filter(lead => normalizePhone(lead.phone) === normalized);
    if (leads.length === 0) return null;
    const first = leads[0]!;
    return {
      phone: first.phone ?? phone,
      name: first.name,
      email: leads.find(lead => lead.email)?.email,
      leads,
    };
  }

  async advanceLeadStatus(source: LeadSource, leadId: string): Promise<void> {
    const db = getPrismaClient();
    if (source === "contact") {
      await db.contactRequest.updateMany({ where: { id: leadId, status: "new" }, data: { status: "in_progress" } });
    } else if (source === "rent") {
      await db.rentRequest.updateMany({ where: { id: leadId, status: "new" }, data: { status: "in_progress" } });
    } else if (source === "sale") {
      await db.saleRequest.updateMany({ where: { id: leadId, status: "new" }, data: { status: "in_progress" } });
    } else if (source === "autopodbor") {
      await db.autoPodborLead.updateMany({ where: { id: leadId, status: "new" }, data: { status: "in_progress" } });
    }
  }

  async getAssignees(): Promise<CrmAssignee[]> {
    const users = await getPrismaClient().user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });
    return users.map(user => ({
      id: user.id,
      name: user.profile?.name || user.login,
      login: user.login,
    }));
  }
}
