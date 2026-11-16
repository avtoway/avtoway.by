import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { contactInfoSchema } from "@/entities/rent/rent.schema";
import type { ContactInfoRepository } from "@/entities/contact/contact-info.repository";
import type { ContactInfo } from "@/entities/contact/contact-info.types";

export async function GET() {
  try {
    const repo = container.get<ContactInfoRepository>("ContactInfoRepository");
    const contact = await repo.get();
    return NextResponse.json({ ok: true, data: contact });
  } catch (e) { return toApiError(e); }
}

export async function PUT(request: Request) {
  try {
    const user = await requireAuth("contacts.manage");
    const parsed = validateOrResponse(contactInfoSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const repo = container.get<ContactInfoRepository>("ContactInfoRepository");
    const contact = await repo.update(parsed.data as unknown as Partial<ContactInfo>);

    await createAuditLog({
      userId: user.id, action: "UPDATE", entity: "ContactInfo", entityId: "main",
      details: { fields: Object.keys(parsed.data) },
    });

    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, data: contact });
  } catch (e) { return toApiError(e); }
}
