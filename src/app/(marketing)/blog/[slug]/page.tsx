import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { BlogRepository } from "@/entities/blog/blog.repository";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";
import CrossSell from "@/shared/ui/cross-sell";
import { SITE_URL } from "@/shared/config/site";
import AdSlotBlock from "@/features/ads/ui/ad-slot";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  try {
    const post = await container.get<BlogRepository>("BlogRepository").getBySlug(slug);
    if (!post || !post.isPublished) return null;
    if (new Date(post.publishedAt).getTime() > Date.now()) return null;
    return post;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Статья не найдена", robots: { index: false, follow: false } };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || "Статья АВТОWAY об автомобилях.";
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: post.cover ? [{ url: post.cover, alt: post.title }] : undefined,
    },
  };
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      if (block.startsWith("## ")) {
        return (
          <h2 key={index} className="mt-8 text-xl font-bold text-white sm:text-2xl">
            {block.slice(3)}
          </h2>
        );
      }
      if (block.startsWith("# ")) {
        return (
          <h2 key={index} className="mt-8 text-xl font-bold text-white sm:text-2xl">
            {block.slice(2)}
          </h2>
        );
      }
      return (
        <p key={index} className="mt-4 text-base leading-relaxed text-zinc-300">
          {block}
        </p>
      );
    });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: post.cover ? `${SITE_URL}${post.cover}` : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: { "@type": "Organization", name: "АВТОWAY", url: SITE_URL },
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <BreadcrumbSchema
        items={[
          { label: "Главная", href: "/" },
          { label: "Блог", href: "/blog" },
          { label: post.title },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <PageBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Блог", href: "/blog" }, { label: post.title }]} />
        <Link href="/blog" className="mt-4 inline-flex text-xs text-zinc-500 transition hover:text-white">← Все статьи</Link>

        <header className="mt-4">
          {post.category && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400">{post.category}</p>}
          <h1 className="mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">{post.title}</h1>
          <p className="mt-3 text-xs text-zinc-500">
            {new Date(post.publishedAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </header>

        {post.cover && (
          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            <Image src={post.cover} alt={post.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" priority />
          </div>
        )}

        <div className="mt-6">
          {post.excerpt && (
            <p className="border-l-2 border-red-500/50 pl-4 text-base leading-relaxed text-zinc-400">{post.excerpt}</p>
          )}
          {renderContent(post.content)}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
          <p className="text-sm text-zinc-400">Остались вопросы по авто?</p>
          <Link href="/contacts" className="mt-3 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-white">
            Задать вопрос
          </Link>
        </div>
      </article>

      <AdSlotBlock slotKey="blog_inline" />

      <div className="mt-10">
        <CrossSell exclude="" title="Услуги АВТОWAY" />
      </div>
    </div>
  );
}
