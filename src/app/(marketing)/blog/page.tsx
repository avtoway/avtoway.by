import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "@/di/composition-root";
import { container } from "@/di/container";
import type { BlogRepository } from "@/entities/blog/blog.repository";
import type { BlogPost } from "@/entities/blog/blog.types";
import PageBreadcrumbs, { BreadcrumbSchema } from "@/shared/ui/page-breadcrumbs";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Блог — полезное об автомобилях",
  description: "Статьи АВТОWAY: как проверить авто перед покупкой, аренда, пригон, обслуживание и лайфхаки.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Блог АВТОWAY",
    description: "Полезные статьи об автомобилях: проверка, покупка, аренда и обслуживание.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await container.get<BlogRepository>("BlogRepository").list(true);
  } catch {
    posts = [];
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <BreadcrumbSchema items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <PageBreadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Блог" }]} />
        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Блог</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Разбираем реальные вопросы: как проверить авто перед покупкой, что учесть при аренде,
            как не переплатить при пригоне и обслуживании.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-400">Статьи скоро появятся.</p>
            <p className="mt-2 text-xs text-zinc-600">
              Пока можно посмотреть <Link href="/works" className="text-red-300 underline">наши работы</Link> или{" "}
              <Link href="/services" className="text-red-300 underline">услуги</Link>.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 transition hover:border-red-500/40"
              >
                <div className="relative aspect-[16/10] bg-zinc-900">
                  {post.cover ? (
                    <Image src={post.cover} alt={post.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">АВТОWAY</div>
                  )}
                </div>
                <div className="p-4">
                  {post.category && <p className="text-[10px] uppercase tracking-wider text-red-400">{post.category}</p>}
                  <p className="mt-1 text-sm font-semibold text-white">{post.title}</p>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-400">{post.excerpt}</p>}
                  <p className="mt-3 text-[10px] text-zinc-600">
                    {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
