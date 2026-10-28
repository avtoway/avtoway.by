import Link from "next/link";
import { SITE_URL } from "@/shared/config/site";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

function serialize(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/** UI-часть хлебных крошек. Не содержит <script>, поэтому безопасна в client-компонентах. */
export default function PageBreadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Хлебные крошки"
      className={`flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.href ?? "current"}-${item.label}`} className="inline-flex items-center gap-1.5">
            {index > 0 && <span aria-hidden="true" className="text-zinc-700">/</span>}
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-400" : undefined} aria-current={isLast ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** JSON-LD BreadcrumbList. Рендерить только из server-компонентов. */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href === "/" ? "" : item.href}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialize(schema) }}
    />
  );
}
