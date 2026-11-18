import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { clientIp } from "@/shared/lib/client-ip";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

interface Props {
  params: Promise<{ id: string }>;
}

/** Публичный редирект рекламного блока с подсчётом клика. */
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    // Не больше 3 кликов с одного IP за 10 минут — защита от скликивания.
    if (!checkRateLimit(`ad-click:${clientIp(request.headers)}:${id}`, 3, 10 * 60 * 1000)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const target = await container.get<PromotionRepository>("PromotionRepository").trackClick(id);
    if (!target) return NextResponse.redirect(new URL("/", request.url));

    const destination = target.startsWith("http") ? target : new URL(target, request.url).toString();
    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
