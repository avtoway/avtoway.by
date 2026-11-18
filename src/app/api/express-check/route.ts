import "@/di/composition-root";
import { NextResponse } from "next/server";
import { z } from "zod";
import { container } from "@/di/container";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import { notifyNewLead } from "@/shared/lib/telegram.server";
import type { ContactRepository } from "@/entities/contact/contact.repository";

const ALLOWED_HOSTS = ["av.by", "kufar.by", "abw.by", "cars.av.by"];

const schema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(100),
  phone: z.string().trim().min(6, "Укажите телефон").max(40),
  url: z.string().trim().min(5, "Вставьте ссылку на объявление").max(1000),
  pageUrl: z.string().trim().max(1000).optional().or(z.literal("")),
  utmSource: z.string().trim().max(200).optional().or(z.literal("")),
  utmMedium: z.string().trim().max(200).optional().or(z.literal("")),
  utmCampaign: z.string().trim().max(200).optional().or(z.literal("")),
});

function normalizeUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isAllowedHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return ALLOWED_HOSTS.some(allowed => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (body && typeof body === "object" && "company" in body && String((body as { company?: unknown }).company ?? "").length > 0) {
      return NextResponse.json({ ok: true, data: { id: null } }, { status: 201 });
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0]?.message ?? "Некорректные данные");
    }
    const input = parsed.data;
    const url = normalizeUrl(input.url);
    if (!isAllowedHost(url)) {
      throw new ValidationError("Поддерживаются ссылки с av.by, kufar.by и abw.by");
    }

    const created = await container.get<ContactRepository>("ContactRepository").create({
      name: input.name,
      phone: input.phone,
      message: `Экспресс-проверка объявления: ${url}`,
      source: "express_check",
      serviceSlug: "inspection",
      pageUrl: input.pageUrl || undefined,
      utmSource: input.utmSource || undefined,
      utmMedium: input.utmMedium || undefined,
      utmCampaign: input.utmCampaign || undefined,
    });

    notifyNewLead({
      source: "Экспресс-проверка объявления",
      service: url,
      name: created.name,
      phone: created.phone,
      message: created.message,
      pageUrl: created.pageUrl,
      utm: [created.utmSource, created.utmMedium, created.utmCampaign].filter(Boolean).join(" / ") || undefined,
    });

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
