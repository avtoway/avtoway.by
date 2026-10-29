import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { ServiceLandingRepository } from "@/entities/service-landing/service-landing.repository";

export async function GET() {
  try {
    await requireAuth("services.manage");
    const repo = container.get<ServiceLandingRepository>("ServiceLandingRepository");
    return NextResponse.json({ ok: true, data: await repo.getAll() });
  } catch (error) {
    return toApiError(error);
  }
}
