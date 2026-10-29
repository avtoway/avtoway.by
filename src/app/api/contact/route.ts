import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import type { ContactRepository } from "@/entities/contact/contact.repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      phone?: string;
      email?: string;
      message?: string;
      source?: string;
      serviceSlug?: string;
      pageUrl?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    };

    const name = body.name?.trim();
    const message = body.message?.trim();
    if (!name || !message) {
      throw new ValidationError("Укажите имя и сообщение");
    }

    const repo = container.get<ContactRepository>("ContactRepository");
    const created = await repo.create({
      name,
      phone: body.phone?.trim() || undefined,
      email: body.email?.trim() || undefined,
      message,
      source: body.source?.trim().slice(0, 50) || "site",
      serviceSlug: body.serviceSlug?.trim().slice(0, 80) || undefined,
      pageUrl: body.pageUrl?.trim().slice(0, 1000) || undefined,
      utmSource: body.utmSource?.trim().slice(0, 200) || undefined,
      utmMedium: body.utmMedium?.trim().slice(0, 200) || undefined,
      utmCampaign: body.utmCampaign?.trim().slice(0, 200) || undefined,
    });

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
