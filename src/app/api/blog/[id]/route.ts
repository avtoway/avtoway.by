import "@/di/composition-root";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { getAuthUser, hasPermission, requireAuth } from "@/lib/auth.server";
import { validateOrResponse } from "@/shared/lib/validation";
import { toApiError, NotFoundError, ConflictError, ForbiddenError } from "@/shared/lib/errors";
import { createAuditLog } from "@/lib/audit.server";
import { deleteUploadFile } from "@/shared/lib/upload-files";
import { blogPostUpdateSchema } from "@/entities/blog/blog.schema";
import type { BlogRepository } from "@/entities/blog/blog.repository";

interface Props {
  params: Promise<{ id: string }>;
}

function repo() {
  return container.get<BlogRepository>("BlogRepository");
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const post = await repo().getById(id);
    if (!post) throw new NotFoundError("Статья не найдена");

    if (!post.isPublished) {
      const user = await getAuthUser();
      if (!hasPermission(user, "services.manage")) throw new ForbiddenError();
    }
    return NextResponse.json({ ok: true, data: post });
  } catch (error) {
    return toApiError(error);
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const user = await requireAuth("services.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Статья не найдена");

    const parsed = validateOrResponse(blogPostUpdateSchema, await request.json().catch(() => ({})));
    if (!("validated" in parsed)) return parsed;

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const conflict = await repo().getBySlug(parsed.data.slug);
      if (conflict) throw new ConflictError("Статья с таким slug уже существует");
    }

    const updated = await repo().update(id, parsed.data);
    await createAuditLog({
      userId: user.id,
      action: "UPDATE",
      entity: "BlogPost",
      entityId: id,
      details: { title: updated.title, slug: updated.slug, isPublished: updated.isPublished },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${updated.slug}`);
    if (existing.slug !== updated.slug) revalidatePath(`/blog/${existing.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const user = await requireAuth("services.manage");
    const { id } = await params;
    const existing = await repo().getById(id);
    if (!existing) throw new NotFoundError("Статья не найдена");

    await repo().delete(id);
    await deleteUploadFile(existing.cover);
    await createAuditLog({
      userId: user.id,
      action: "DELETE",
      entity: "BlogPost",
      entityId: id,
      details: { title: existing.title, slug: existing.slug },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${existing.slug}`);
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, data: { deleted: id } });
  } catch (error) {
    return toApiError(error);
  }
}
