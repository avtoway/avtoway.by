import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import type { ContactRepository } from "@/entities/contact/contact.repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      phone?: string;
      email?: string;
      message?: string;
    };

    const name = body.name?.trim();
    const message = body.message?.trim();
    if (!name || !message) {
      throw new ValidationError("Укажите имя и сообщение");
    }

    const repo = container.get<ContactRepository>("ContactRepository");
    const created = await repo.create({
      name,
      phone: body.phone?.trim() || undefined,
      email: body.email?.trim() || undefined,
      message,
    });

    return NextResponse.json({ ok: true, data: { id: created.id } }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
