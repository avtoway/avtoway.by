import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

interface Props {
  params: Promise<{ id: string }>;
}

/** Публичный редирект рекламного блока с подсчётом клика. */
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const target = await container.get<PromotionRepository>("PromotionRepository").trackClick(id);
    if (!target) return NextResponse.redirect(new URL("/", request.url));

    const destination = target.startsWith("http") ? target : new URL(target, request.url).toString();
    return NextResponse.redirect(destination);
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }
}
