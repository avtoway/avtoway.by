import "@/di/composition-root";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { fetchInboxEmails } from "@/shared/lib/mail";

export async function POST() {
  try {
    await requireAuth("email.manage");
    const result = await fetchInboxEmails();
    return NextResponse.json({ ok: true, data: { newCount: result.count, error: result.error } });
  } catch (e) { return toApiError(e); }
}
