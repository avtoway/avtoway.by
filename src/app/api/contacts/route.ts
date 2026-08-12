import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError } from "@/shared/lib/errors";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";

export async function GET() {
  try {
    const repo = container.get<ContactInfoRepository>("ContactInfoRepository");
    const contact = await repo.get();
    return NextResponse.json({ ok: true, data: contact });
  } catch (e) { return toApiError(e); }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const repo = container.get<ContactInfoRepository>("ContactInfoRepository");
    const contact = await repo.update(body);
    return NextResponse.json({ ok: true, data: contact });
  } catch (e) { return toApiError(e); }
}
