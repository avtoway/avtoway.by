import "@/di/composition-root";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";

export async function GET() {
  const db = getPrismaClient();
  const [fuels, transmissions] = await Promise.all([
    db.fuel.findMany({ orderBy: { name: "asc" } }),
    db.transmission.findMany({ orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ ok: true, data: { fuels, transmissions } });
}
