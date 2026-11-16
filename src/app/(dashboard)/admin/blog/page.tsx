"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/shared/lib/toast-context";
import { useConfirm } from "@/shared/ui/confirm-dialog";
import type { BlogPost } from "@/entities/blog/blog.types";

const input = "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500";
const label = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500";
const smallBtn = "rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white";

interface FormState {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  category: string;
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  publishedAt: string;
}

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    cover: "",
    category: "",
    seoTitle: "",
    seoDescription: "",
    isPublished: false,
    publishedAt: new Date().toISOString().slice(0, 10),
  };
}

function toForm(post: BlogPost): FormState {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    content: post.content,
    cover: post.cover ?? "",
    category: post.category ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    isPublished: post.isPublished,
    publishedAt: post.publishedAt.slice(0, 10),
  };
}

function slugify(value: string): string {
  const map: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
  return value.toLowerCase().split("").map(ch => map[ch] ?? ch).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { confirm, dialog } = useConfirm();

  async function load() {
    setLoading(true);
    try {
      const json = await fetch("/api/blog", { cache: "no-store" }).then(r => r.json());
      if (json.ok) setItems(json.data);
      else toast(json.error ?? "Не удалось загрузить статьи", "error");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount
  useEffect(() => { void load(); }, []);

  async function save() {
    if (!form) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast("Заполните заголовок и текст", "error");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim() || slugify(form.title),
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim(),
        cover: form.cover.trim() || undefined,
        category: form.category.trim() || undefined,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        isPublished: form.isPublished,
        publishedAt: form.publishedAt || undefined,
      };
      const json = await fetch(form.id ? `/api/blog/${form.id}` : "/api/blog", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then(r => r.json());

      if (!json.ok) {
        toast(json.error ?? "Не удалось сохранить", "error");
        return;
      }
      setForm(toForm(json.data));
      toast("Статья сохранена");
      await load();
    } catch {
      toast("Ошибка сохранения", "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(post: BlogPost) {
    const ok = await confirm({
      title: "Удаление статьи",
      message: `Удалить «${post.title}»?`,
      confirmLabel: "Удалить",
      variant: "danger",
    });
    if (!ok) return;
    const json = await fetch(`/api/blog/${post.id}`, { method: "DELETE" }).then(r => r.json());
    if (json.ok) {
      toast("Статья удалена");
      if (form?.id === post.id) setForm(null);
      await load();
    } else {
      toast(json.error ?? "Ошибка удаления", "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Блог</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Статьи для SEO и доверия. Публикуются на /blog и попадают в sitemap.
          </p>
        </div>
        <button type="button" onClick={() => setForm(emptyForm())} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          + Новая статья
        </button>
      </div>

      {form && (
        <section className="mb-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/30 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">{form.id ? "Редактирование статьи" : "Новая статья"}</h2>
            <button type="button" onClick={() => setForm(null)} className={smallBtn}>Закрыть</button>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <label>
              <span className={label}>Заголовок *</span>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value, slug: form.id ? form.slug : slugify(e.target.value) })}
                className={input}
              />
            </label>
            <label>
              <span className={label}>Slug</span>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="kak-proverit-avto" className={input} />
            </label>
            <label>
              <span className={label}>Категория</span>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Проверка авто" className={input} />
            </label>
            <label>
              <span className={label}>Дата публикации</span>
              <input value={form.publishedAt} onChange={e => setForm({ ...form, publishedAt: e.target.value })} className={input} />
            </label>
            <label className="lg:col-span-2">
              <span className={label}>Обложка (URL)</span>
              <input value={form.cover} onChange={e => setForm({ ...form, cover: e.target.value })} placeholder="/uploads/general/cover.jpg" className={input} />
            </label>
            <label className="lg:col-span-2">
              <span className={label}>Краткое описание</span>
              <textarea rows={2} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className={input} />
            </label>
            <label className="lg:col-span-2">
              <span className={label}>Текст статьи * (пустая строка — новый абзац, «## » — подзаголовок)</span>
              <textarea rows={14} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={input} />
            </label>
            <label>
              <span className={label}>SEO-заголовок</span>
              <input value={form.seoTitle} onChange={e => setForm({ ...form, seoTitle: e.target.value })} className={input} />
            </label>
            <label>
              <span className={label}>SEO-описание</span>
              <input value={form.seoDescription} onChange={e => setForm({ ...form, seoDescription: e.target.value })} className={input} />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
              Опубликовать
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setForm(null)} className={smallBtn}>Отмена</button>
            <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {saving ? "Сохранение..." : "Сохранить статью"}
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Загрузка...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">
          Статей пока нет.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map(post => (
            <article key={post.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{post.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    /blog/{post.slug} · {new Date(post.publishedAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${post.isPublished ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-slate-700 bg-slate-800 text-slate-400"}`}>
                  {post.isPublished ? "Опубликована" : "Черновик"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setForm(toForm(post))} className={smallBtn}>Редактировать</button>
                {post.isPublished && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={smallBtn}>Открыть</a>
                )}
                <button type="button" onClick={() => void remove(post)} className="rounded-lg border border-red-900/50 px-2.5 py-1.5 text-xs text-red-300 hover:border-red-600">Удалить</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {dialog}
    </div>
  );
}
