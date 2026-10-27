import "@/di/composition-root";
import { NextResponse } from "next/server";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { revalidatePath } from "next/cache";
import { toApiError } from "@/shared/lib/errors";
import type { AutoPodborRepository } from "@/entities/autopodbor/autopodbor.repository";
import { ENTITY_REGISTRY } from "../../_lib/registry";

function repo() {
  return container.get<AutoPodborRepository>("AutoPodborRepository");
}

function apiError(e: unknown) {
  const code = typeof e === "object" && e !== null && "code" in e ? (e as { code?: string }).code : undefined;
  if (code === "P2002") {
    return NextResponse.json({ ok: false, error: "Такая запись уже существует — проверьте slug" }, { status: 409 });
  }
  return toApiError(e);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const { entity, id } = await params;
    const def = ENTITY_REGISTRY[entity];
    if (!def) return NextResponse.json({ ok: false, error: "Неизвестный раздел" }, { status: 404 });

    const body = await request.json().catch(() => null);
    const parsed = def.schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? "Некорректные данные" }, { status: 400 });
    }

    const updated = await def.update(repo(), id, parsed.data as Record<string, unknown>);

    await createAuditLog({ userId: user.id, action: "UPDATE", entity: def.entity, entityId: id, details: body });
    revalidatePath("/services/inspection");

    return NextResponse.json({ ok: true, data: updated });
  } catch (e) { return apiError(e); }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entity: string; id: string }> },
) {
  try {
    const user = await requireAuth("autopodbor.manage");
    const { entity, id } = await params;
    const def = ENTITY_REGISTRY[entity];
    if (!def) return NextResponse.json({ ok: false, error: "Неизвестный раздел" }, { status: 404 });

    await def.remove(repo(), id);
    await createAuditLog({ userId: user.id, action: "DELETE", entity: def.entity, entityId: id });
    revalidatePath("/services/inspection");

    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (e) { return apiError(e); }
}
