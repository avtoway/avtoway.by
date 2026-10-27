import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth.server";
import { revalidatePath } from "next/cache";
import { toApiError } from "@/shared/lib/errors";

export async function POST() {
  try {
    await requireAuth("autopodbor.manage");
    revalidatePath("/services/inspection");
    return NextResponse.json({ ok: true });
  } catch (e) { return toApiError(e); }
}
