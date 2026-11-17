import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import type { PromotionRepository } from "@/entities/promotion/promotion.repository";

interface Props {
  params: Promise<{ key: string }>;
}

/** Публичные данные активного слота. HTML отдаётся только для доверенных админов. */
export async function GET(_request: Request, { params }: Props) {
  try {
    const { key } = await params;
    const slot = await container.get<PromotionRepository>("PromotionRepository").getServedSlot(key);
    if (!slot) return NextResponse.json({ ok: true, data: null });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: slot.id,
          key: slot.key,
          title: slot.title,
          html: slot.html,
          imageUrl: slot.imageUrl,
          targetUrl: slot.targetUrl,
          height: slot.height,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: true, data: null });
  }
}
