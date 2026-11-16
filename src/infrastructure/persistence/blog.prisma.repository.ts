import { getPrismaClient } from "./prisma.client";
import { randomUUID } from "node:crypto";
import type { BlogRepository } from "@/entities/blog/blog.repository";
import type { BlogPost, BlogPostInput } from "@/entities/blog/blog.types";

function iso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : String(value);
}

function toPost(row: any): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? undefined,
    content: row.content,
    cover: row.cover ?? undefined,
    category: row.category ?? undefined,
    seoTitle: row.seoTitle ?? undefined,
    seoDescription: row.seoDescription ?? undefined,
    isPublished: row.isPublished,
    publishedAt: iso(row.publishedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export class PrismaBlogRepository implements BlogRepository {
  private get db() { return getPrismaClient(); }

  async list(publishedOnly = false): Promise<BlogPost[]> {
    const rows = await this.db.blogPost.findMany({
      where: publishedOnly ? { isPublished: true, publishedAt: { lte: new Date() } } : undefined,
      orderBy: { publishedAt: "desc" },
    });
    return rows.map(toPost);
  }

  async getById(id: string): Promise<BlogPost | null> {
    const row = await this.db.blogPost.findUnique({ where: { id } });
    return row ? toPost(row) : null;
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    const row = await this.db.blogPost.findUnique({ where: { slug } });
    return row ? toPost(row) : null;
  }

  async create(input: BlogPostInput): Promise<BlogPost> {
    const row = await this.db.blogPost.create({
      data: {
        id: randomUUID(),
        slug: input.slug,
        title: input.title,
        excerpt: input.excerpt || null,
        content: input.content,
        cover: input.cover || null,
        category: input.category || null,
        seoTitle: input.seoTitle || null,
        seoDescription: input.seoDescription || null,
        isPublished: input.isPublished ?? false,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : new Date(),
      },
    });
    return toPost(row);
  }

  async update(id: string, input: Partial<BlogPostInput>): Promise<BlogPost> {
    const data: Record<string, unknown> = {};
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.title !== undefined) data.title = input.title;
    if (input.excerpt !== undefined) data.excerpt = input.excerpt || null;
    if (input.content !== undefined) data.content = input.content;
    if (input.cover !== undefined) data.cover = input.cover || null;
    if (input.category !== undefined) data.category = input.category || null;
    if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle || null;
    if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription || null;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;
    if (input.publishedAt !== undefined) data.publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();

    const row = await this.db.blogPost.update({ where: { id }, data });
    return toPost(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.blogPost.delete({ where: { id } });
  }
}
