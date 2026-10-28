import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { createAuditLog } from "@/lib/audit.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { ConflictError, toApiError } from "@/shared/lib/errors";
import { saleCarCreateSchema } from "@/entities/sell/sale-car.schema";
import type { SaleCarFilters } from "@/entities/sell/sale-car.types";
import type { SaleCarRepository } from "@/entities/sell/sale-car.repository";

function repo() {
  return container.get<SaleCarRepository>("SaleCarRepository");
}

function numberParam(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function boolParam(value: string | null): boolean | undefined {
  if (value == null) return undefined;
  return value === "true" || value === "1";
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("showAll") === "true";
    if (showAll) await requireAuth("sell.manage");

    const filters: SaleCarFilters = {
      showAll,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      brandSlug: searchParams.get("brand") ?? undefined,
      modelSlug: searchParams.get("model") ?? undefined,
      generation: searchParams.get("generation") ?? undefined,
      priceMin: numberParam(searchParams.get("priceMin")),
      priceMax: numberParam(searchParams.get("priceMax")),
      yearMin: numberParam(searchParams.get("yearMin")),
      yearMax: numberParam(searchParams.get("yearMax")),
      transmission: searchParams.get("transmission") ?? undefined,
      fuel: searchParams.get("fuel") ?? undefined,
      engineMin: numberParam(searchParams.get("engineMin")),
      engineMax: numberParam(searchParams.get("engineMax")),
      bodyTypes: searchParams.get("body")?.split(",").filter(Boolean),
      driveType: searchParams.get("drive") ?? undefined,
      mileageMax: numberParam(searchParams.get("mileageMax")),
      inspected: boolParam(searchParams.get("inspected")),
      originalPaint: boolParam(searchParams.get("originalPaint")),
      noAccidents: boolParam(searchParams.get("noAccidents")),
      allowExchange: boolParam(searchParams.get("allowExchange")),
      hideSold: boolParam(searchParams.get("hideSold")),
      featured: boolParam(searchParams.get("featured")),
      sort: searchParams.get("sort") ?? undefined,
      limit: numberParam(searchParams.get("limit")),
    };
    return NextResponse.json({ ok: true, data: await repo().getAll(filters) });
  } catch (e) {
    return toApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("sell.manage");
    const body = await request.json().catch(() => null);
    const parsed = validateOrResponse(saleCarCreateSchema, body);
    if (!("validated" in parsed)) return parsed;

    const existing = await repo().getBySlug(parsed.data.slug);
    if (existing) throw new ConflictError("Автомобиль с таким slug уже существует");

    const created = await repo().create({
      ...parsed.data,
      brandId: parsed.data.brandId || undefined,
      modelId: parsed.data.modelId || undefined,
      features: parsed.data.features ?? [],
      customSpecs: parsed.data.customSpecs ?? [],
      photos: parsed.data.photos ?? [],
      isNegotiable: parsed.data.isNegotiable ?? true,
      allowExchange: parsed.data.allowExchange ?? false,
      allowCredit: parsed.data.allowCredit ?? false,
      steering: parsed.data.steering ?? "left",
      condition: parsed.data.condition ?? "used",
      customsCleared: parsed.data.customsCleared ?? true,
      vinVerified: parsed.data.vinVerified ?? false,
      originalPaint: parsed.data.originalPaint ?? false,
      noAccidents: parsed.data.noAccidents ?? false,
      serviceBook: parsed.data.serviceBook ?? false,
      isInspected: parsed.data.isInspected ?? true,
      city: parsed.data.city || "Минск",
      status: parsed.data.status ?? "available",
      isFeatured: parsed.data.isFeatured ?? false,
      isActive: parsed.data.isActive ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    });

    await createAuditLog({
      userId: user.id, action: "CREATE", entity: "SaleCar", entityId: created.id,
      details: { title: created.title, slug: created.slug },
    });
    revalidatePath("/services/sell");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e) {
    return toApiError(e);
  }
}
