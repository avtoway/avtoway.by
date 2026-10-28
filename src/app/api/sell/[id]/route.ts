import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, NotFoundError, toApiError } from "@/shared/lib/errors";
import { saleCarUpdateSchema } from "@/entities/sell/sale-car.schema";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<SaleCarRepository>("SaleCarRepository");
}

export async function GET(_: Request, { params }: Props) {
  try {
    await requireAuth("sell.manage");
    const { id } = await params;
    const car = await repo().getById(id);
    if (!car) throw new NotFoundError("Автомобиль не найден");
    return NextResponse.json({ ok: true, data: car });
  } catch (e) {
    return toApiError(e);
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const user = await requireAuth("sell.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Автомобиль не найден");

    const body = await request.json().catch(() => null);
    const parsed = validateOrResponse(saleCarUpdateSchema, body);
    if (!("validated" in parsed)) return parsed;

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const conflict = await repo().getBySlug(parsed.data.slug);
      if (conflict) throw new ConflictError("Автомобиль с таким slug уже существует");
    }

    const updated = await repo().update(id, parsed.data);
    await createAuditLog({
      userId: user.id, action: "UPDATE", entity: "SaleCar", entityId: id,
      details: { title: updated.title, slug: updated.slug, status: updated.status },
    });
    revalidatePath("/services/sell");
    revalidatePath(`/services/sell/${updated.slug}`);
    return NextResponse.json({ ok: true, data: updated });
  } catch (e) {
    return toApiError(e);
  }
}

export async function DELETE(_: Request, { params }: Props) {
  try {
    const user = await requireAuth("sell.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Автомобиль не найден");
    await repo().delete(id);
    await createAuditLog({
      userId: user.id, action: "DELETE", entity: "SaleCar", entityId: id,
      details: { title: existing.title, slug: existing.slug },
    });
    revalidatePath("/services/sell");
    revalidatePath(`/services/sell/${existing.slug}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return toApiError(e);
  }
}
