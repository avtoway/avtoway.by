import "@/di/composition-root";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brandSlug = searchParams.get("brand");
  const db = getPrismaClient();

  if (brandSlug) {
    const models = await db.carModel.findMany({
      where: { brand: { slug: brandSlug } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ ok: true, data: models });
  }

  const brands = await db.carBrand.findMany({
    orderBy: { name: "asc" },
    include: { models: { orderBy: { name: "asc" } } },
  });
  return NextResponse.json({ ok: true, data: brands });
}
