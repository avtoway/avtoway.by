import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { autopodborLeadSchema } from "@/entities/autopodbor/autopodbor.schema";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import type { LeadFilters } from "@/entities/autopodbor/autopodbor.types";

function repo() {
  return container.get<AutoPodborRepository>("AutoPodborRepository");
}

export async function GET(request: Request) {
  try {
    await requireAnyAuth(["autopodbor.requests", "autopodbor.view", "autopodbor.manage"]);
    const { searchParams } = new URL(request.url);
    const filters: LeadFilters = {
      status: searchParams.get("status") ?? undefined,
      serviceSlug: searchParams.get("service") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      dateFrom: searchParams.get("from") ?? undefined,
      dateTo: searchParams.get("to") ?? undefined,
      page: Number(searchParams.get("page") ?? 1) || 1,
      limit: Number(searchParams.get("limit") ?? 50) || 50,
    };
    return NextResponse.json({ ok: true, data: await repo().getLeads(filters) });
  } catch (e) { return toApiError(e); }
}

// Public: заявка с лендинга (форма или квиз)
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Honeypot: боты заполняют скрытое поле — отвечаем «успехом», но лид не создаём
    if (body && typeof body === "object" && "company" in body && String((body as { company?: unknown }).company ?? "").length > 0) {
      return NextResponse.json({ ok: true, data: { id: null } }, { status: 201 });
    }

    const parsed = autopodborLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" }, { status: 400 });
    }
    const input = parsed.data;
    const service = repo();

    // Название и цену услуги берём из БД, а не из клиента
    const tariffs = await service.getTariffs(true);
    const tariff = input.serviceSlug ? tariffs.find(t => t.slug === input.serviceSlug) : undefined;

    const lead = await service.createLead({
      name: input.name,
      phone: input.phone,
      email: input.email?.trim() || undefined,
      messenger: input.messenger,
      city: input.city,
      budgetFrom: input.budgetFrom,
      budgetTo: input.budgetTo,
      brand: input.brand,
      model: input.model,
      serviceSlug: tariff?.slug,
      serviceTitle: tariff?.title,
      comment: input.comment,
      quiz: input.quiz ? JSON.stringify(input.quiz) : undefined,
      source: input.source,
      priceQuoted: tariff?.price,
      pageUrl: input.pageUrl,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    });

    return NextResponse.json({ ok: true, data: { id: lead.id } }, { status: 201 });
  } catch (e) {
    // Внутренние детали не отдаём
    console.error("autopodbor lead error:", e);
    return NextResponse.json({ ok: false, error: "Не удалось отправить заявку. Попробуйте позже." }, { status: 500 });
  }
}
