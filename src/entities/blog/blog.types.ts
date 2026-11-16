export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostInput {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  cover?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  isPublished?: boolean;
  publishedAt?: string;
}
