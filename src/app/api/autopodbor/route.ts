import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";

/**
 * Публичный снимок лендинга автоподбора.
 * Если лендинг выключен — `data: null` (страница отдаёт 404).
 */
export async function GET() {
  try {
    const repo = container.get<AutoPodborRepository>("AutoPodborRepository");
    const data = await repo.getPublicData();

    if (!data.settings.isActive) {
      return NextResponse.json({ ok: true, data: null });
    }

    return NextResponse.json(
      { ok: true, data },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Не удалось загрузить данные" }, { status: 500 });
  }
}
