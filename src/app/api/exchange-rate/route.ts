import { NextResponse } from "next/server";
import { getUsdRate } from "@/shared/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = await getUsdRate();
  return NextResponse.json({ ok: true, rate });
}
