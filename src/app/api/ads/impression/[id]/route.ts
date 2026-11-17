import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

interface Props {
  params: Promise<{ id: string }>;
}

/** Публичный беакон показа рекламного блока. */
export async function POST(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    await container.get<PromotionRepository>("PromotionRepository").trackImpression(id);
  } catch {
    // Счётчик не должен ломать страницу.
  }
  return new NextResponse(null, { status: 204 });
}
