import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import type { RentCarRepository } from "@/entities/rent/rent-car.repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const showAll = searchParams.get("showAll") === "true";
    const extras = await repo.getExtras(showAll);
    return NextResponse.json({ ok: true, data: extras });
  } catch (e) { return toApiError(e); }
}

export async function POST(request: Request) {
  try {
    await requireAuth("rent.manage");
    const body = await request.json().catch(() => ({}));
    const repo = container.get<RentCarRepository>("RentCarRepository");
    const extra = await repo.createExtra(body);
    return NextResponse.json({ ok: true, data: extra }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
