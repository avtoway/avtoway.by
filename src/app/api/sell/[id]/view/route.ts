import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError } from "@/shared/lib/errors";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";

    // Не раздуваем счётчик: не больше 30 просмотров в час на IP + авто.
    if (checkRateLimit(`view:sell:${id}:${ip}`, 30, 60 * 60 * 1000)) {
      await container.get<SaleCarRepository>("SaleCarRepository").incrementViews(id);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiError(error);
  }
}
