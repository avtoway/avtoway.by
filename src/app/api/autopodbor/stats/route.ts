import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAnyAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";

export async function GET() {
  try {
    await requireAnyAuth(["autopodbor.requests", "autopodbor.view", "autopodbor.manage"]);
    const repo = container.get<AutoPodborRepository>("AutoPodborRepository");
    return NextResponse.json({ ok: true, data: await repo.getStats() });
  } catch (e) { return toApiError(e); }
}
