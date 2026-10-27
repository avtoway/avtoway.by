import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { daysBetween, firstValidationError, quoteRent, rentRequestSchema } from "@/shared/lib/rent-request";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function GET() {
  try {
    await requireAuth("rent.manage");
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const requests = await repo.getRentRequests();
    return NextResponse.json({ ok: true, data: requests });
  } catch (e) { return toApiError(e); }
}

// Public: create a rental request from the calculator.
// Все суммы пересчитываются на сервере — клиентским total/deposit не доверяем.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = rentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: firstValidationError(parsed.error) }, { status: 400 });
    }
    const input = parsed.data;

    const repo = container.get<RentCarRepository>("RentCarRepository");
    const car = await repo.getById(input.carId);
    if (!car || !car.isActive) {
      return NextResponse.json({ ok: false, error: "Автомобиль недоступен" }, { status: 404 });
    }

    const isTaxi = car.rentType?.slug === "taxi";
    const days = daysBetween(input.startDate, input.endDate);
    const { minDays, maxDays } = await repo.getRentSettings();
    const min = isTaxi ? Math.max(7, minDays) : minDays;

    if (days < min) {
      return NextResponse.json(
        { ok: false, error: isTaxi ? "Аренда под такси — от 7 дней" : `Минимальный срок — ${min} дн.` },
        { status: 400 },
      );
    }
    if (days > maxDays) {
      return NextResponse.json({ ok: false, error: `Максимальный срок — ${maxDays} дн.` }, { status: 400 });
    }

    const [tiers, extras] = await Promise.all([repo.getPricingTiers(), repo.getExtras()]);
    const selectedExtras = extras.filter(extra => input.extraIds?.includes(extra.id));
    const quote = quoteRent({ car, days, tiers, extras: selectedExtras });

    const created = await repo.createRentRequest({
      carId: car.id,
      name: input.name,
      phone: input.phone?.trim() || undefined,
      email: input.email?.trim() || undefined,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      extras: quote.extrasLabel || undefined,
      total: quote.total,
      deposit: quote.deposit || undefined,
      message:
        `Заявка из калькулятора: ${car.name}, ${days} дн. (${input.startDate} — ${input.endDate}), ` +
        `итог ${quote.total} BYN, залог ${quote.deposit || "по согласованию"} BYN.`,
    });

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
