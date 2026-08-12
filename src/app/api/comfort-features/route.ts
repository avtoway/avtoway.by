import "@/di/composition-root";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET() {
  const db = getPrismaClient();
  const features = await db.comfortFeature.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ ok: true, data: features });
}
