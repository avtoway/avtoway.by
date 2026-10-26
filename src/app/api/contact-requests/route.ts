import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { toApiError, ValidationError } from "@/shared/lib/errors";
import type { ContactRepository } from "@/entities/contact/contact.repository";
import type { ContactRequestStatus } from "@/entities/contact/contact";

const STATUSES: ContactRequestStatus[] = ["new", "in_progress", "done", "archived"];

export async function GET() {
  try {
    await requireAuth("contacts.manage");
    const repo = container.get<ContactRepository>("ContactRepository");
    const items = await repo.getAll();
    return NextResponse.json({ ok: true, data: items });
  } catch (e) { return toApiError(e); }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth("contacts.manage");
    const body = await request.json().catch(() => ({})) as { id?: string; status?: string };
    if (!body.id || !STATUSES.includes(body.status as ContactRequestStatus)) {
      throw new ValidationError("Некорректные данные");
    }
    const repo = container.get<ContactRepository>("ContactRepository");
    const updated = await repo.updateStatus(body.id, body.status as ContactRequestStatus);
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return toApiError(e); }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth("contacts.manage");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) throw new ValidationError("id обязателен");
    const repo = container.get<ContactRepository>("ContactRepository");
    await repo.delete(id);
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return toApiError(e); }
}
