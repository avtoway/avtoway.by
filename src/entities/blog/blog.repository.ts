import type { BlogPost, BlogPostInput } from "./blog.types";

export interface BlogRepository {
  list(publishedOnly?: boolean): Promise<BlogPost[]>;
  getById(id: string): Promise<BlogPost | null>;
  getBySlug(slug: string): Promise<BlogPost | null>;
  create(input: BlogPostInput): Promise<BlogPost>;
  update(id: string, input: Partial<BlogPostInput>): Promise<BlogPost>;
  delete(id: string): Promise<void>;
}
