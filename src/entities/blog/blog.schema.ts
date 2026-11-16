import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const blogPostInputSchema = z.object({
  slug: z.string().trim().min(2, "Укажите slug").max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug: только латиница, цифры и дефис"),
  title: z.string().trim().min(3, "Укажите заголовок").max(200),
  excerpt: optionalText(500),
  content: z.string().trim().min(20, "Текст статьи слишком короткий").max(100_000),
  cover: optionalText(1000),
  category: optionalText(80),
  seoTitle: optionalText(200),
  seoDescription: optionalText(400),
  isPublished: z.boolean().optional(),
  publishedAt: optionalText(40),
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();
