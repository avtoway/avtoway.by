import "@/di/composition-root";
import { NextResponse } from "next/server";
import { toApiError } from "@/shared/lib/errors";
import { sendEmail } from "@/shared/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { to, subject, body: emailBody } = body;
    if (!to || !subject || !emailBody) {
      return NextResponse.json({ ok: false, error: "Поля to, subject, body обязательны" }, { status: 400 });
    }
    const result = await sendEmail(to, subject, emailBody);
    if (result.status === "failed") {
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data: { id: result.id } }, { status: 201 });
  } catch (e) { return toApiError(e); }
}
