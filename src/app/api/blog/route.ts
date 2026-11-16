import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { getAuthUser, hasPermission, requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, ConflictError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { blogPostInputSchema } from "@/entities/blog/blog.schema";
import type { BlogRepository } from "@/entities/blog/blog.repository";

function repo() {
  return container.get<BlogRepository>("BlogRepository");
}

export async function GET() {
  try {
    const user = await getAuthUser();
    const canManage = hasPermission(user, "services.manage");
    return NextResponse.json({ ok: true, data: await repo().list(!canManage) });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth("services.manage");
    const parsed = validateOrResponse(blogPostInputSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    const existing = await repo().getBySlug(parsed.data.slug);
    if (existing) throw new ConflictError("Статья с таким slug уже существует");

    const created = await repo().create(parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "BlogPost",
      entityId: created.id,
      details: { title: created.title, slug: created.slug },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${created.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}
