import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { clientIp } from "@/shared/lib/client-ip";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

interface Props {
  params: Promise<{ id: string }>;
}

/** Публичный маяк показа рекламного блока. */
export async function POST(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    // Защита от накрутки: не больше 5 показов с одного IP за 10 минут.
    if (!checkRateLimit(`ad-impression:${clientIp(request.headers)}:${id}`, 5, 10 * 60 * 1000)) {
      return new NextResponse(null, { status: 204 });
    }
    await container.get<PromotionRepository>("PromotionRepository").trackImpression(id);
  } catch {
    // Счётчик не должен ломать страницу.
  }
  return new NextResponse(null, { status: 204 });
}
