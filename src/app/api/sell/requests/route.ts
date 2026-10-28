import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, NotFoundError } from "@/shared/lib/errors";
import { saleRequestSchema } from "@/entities/sell/sale-car.schema";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

function repo() {
  return container.get<SaleCarRepository>("SaleCarRepository");
}

export async function GET(request: Request) {
  try {
    await requireAuth("sell.manage");
    const { searchParams } = new URL(request.url);
    const data = await repo().getRequests({
      type: searchParams.get("type") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return toApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    // Honeypot: боты заполняют скрытое поле — отвечаем успехом, но заявку не создаём.
    if (body && typeof body === "object" && "company" in body && String((body as { company?: unknown }).company ?? "").length > 0) {
      return NextResponse.json({ ok: true, data: { id: null } }, { status: 201 });
    }

    const parsed = saleRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
        { status: 400 },
      );
    }

    const input = parsed.data;
    if (input.carId) {
      const car = await repo().getById(input.carId);
      if (!car || !car.isActive || car.status === "draft") throw new NotFoundError("Автомобиль не найден");
    }

    const created = await repo().createRequest({
      type: input.type,
      carId: input.carId || undefined,
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      carInfo: input.carInfo || undefined,
      offerPrice: input.offerPrice ?? undefined,
      comment: input.comment || undefined,
    });

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (e) {
    return toApiError(e);
  }
}
