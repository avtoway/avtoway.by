import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { createBackup, listBackups } from "@/shared/lib/backup.server";

export async function GET() {
  try {
    await requireAuth("audit.view");
    return NextResponse.json({ ok: true, data: await listBackups() });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST() {
  try {
    await requireAuth("audit.view");
    return NextResponse.json({ ok: true, data: await createBackup() }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
