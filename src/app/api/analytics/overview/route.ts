import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { AnalyticsRepository } from "@/entities/analytics/analytics.repository";

export async function GET(request: Request) {
  try {
    await requireAuth("audit.view");
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? 30) || 30;
    const repo = container.get<AnalyticsRepository>("AnalyticsRepository");
    return NextResponse.json({ ok: true, data: await repo.getOverview(days) });
  } catch (error) {
    return toApiError(error);
  }
}
