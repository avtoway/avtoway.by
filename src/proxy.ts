import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { verifyToken } from "@/lib/auth-token";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { notFoundHtml } from "@/shared/lib/not-found-response";

/** Кэш «существует ли страница» на минуту: proxy не должен бить в БД на каждый запрос. */
const contentCache = new Map<string, { exists: boolean; expiresAt: number }>();
const CONTENT_CACHE_TTL_MS = 60_000;

async function contentExists(pathname: string): Promise<boolean | null> {
  const now = Date.now();
  const cached = contentCache.get(pathname);
  if (cached && cached.expiresAt > now) return cached.exists;

  let exists: boolean | null = null;
  try {
    const db = getPrismaClient();
    let match: RegExpMatchArray | null;

    if ((match = pathname.match(/^\/services\/rent\/([^/]+)$/))) {
      if (match[1] === "calculator") return null;
      const row = await db.rentCar.findUnique({ where: { slug: match[1] }, select: { isActive: true } });
      exists = Boolean(row?.isActive);
    } else if ((match = pathname.match(/^\/services\/sell\/([^/]+)$/))) {
      const row = await db.saleCar.findUnique({ where: { slug: match[1] }, select: { isActive: true } });
      exists = Boolean(row?.isActive);
    } else if ((match = pathname.match(/^\/services\/([^/]+)$/))) {
      const row = await db.service.findUnique({ where: { slug: match[1] }, select: { isActive: true } });
      exists = Boolean(row?.isActive);
    } else if ((match = pathname.match(/^\/blog\/([^/]+)$/))) {
      const row = await db.blogPost.findUnique({ where: { slug: match[1] }, select: { isPublished: true } });
      exists = Boolean(row?.isPublished);
    } else if ((match = pathname.match(/^\/works\/([^/]+)$/))) {
      const row = await db.autoPodborCase.findUnique({ where: { slug: match[1] }, select: { isActive: true } });
      exists = Boolean(row?.isActive);
    }
  } catch {
    // При сбое БД не блокируем страницу: пусть рендер сам решит, что показать.
    return null;
  }

  if (exists !== null) {
    if (contentCache.size > 500) contentCache.clear();
    contentCache.set(pathname, { exists, expiresAt: now + CONTENT_CACHE_TTL_MS });
  }
  return exists;
}

function clientIp(request: NextRequest): string {
  // На VPS за nginx сюда приходит реальный IP; при прямом доступе заголовок можно подделать
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Честный 404 до стриминга: страницы с динамическими сегментами сами отдают 200 из-за streaming.
  if (
    request.method === "GET" &&
    (pathname.startsWith("/services/") || pathname.startsWith("/blog/") || pathname.startsWith("/works/"))
  ) {
    const exists = await contentExists(pathname);
    if (exists === false) {
      return new Response(notFoundHtml(), {
        status: 404,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-robots-tag": "noindex, follow",
          "cache-control": "public, max-age=60",
        },
      });
    }
  }

  // Публичные формы: защита от спама/флуда (лиды автоподбора — 5/10 мин, остальные — 10/10 мин)
  const isAutoPodborLead = pathname === "/api/autopodbor/leads";
  const isSaleRequest = pathname === "/api/sell/requests";
  const isPublicWrite =
    request.method === "POST" &&
    (pathname === "/api/rent/requests" || pathname === "/api/contact" || pathname === "/api/express-check" || isAutoPodborLead || isSaleRequest);
  if (isPublicWrite && !checkRateLimit(
    `public:${pathname}:${clientIp(request)}`,
    isAutoPodborLead ? 5 : pathname === "/api/contact" ? 30 : 10,
    10 * 60 * 1000,
  )) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок. Попробуйте позже или позвоните нам." },
      { status: 429 },
    );
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get("admin_token");
    if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));

    const user = verifyToken(token.value);
    if (!user) return NextResponse.redirect(new URL("/admin/login", request.url));

    const perms = user.permissions ?? [];

    if (pathname.startsWith("/admin/users") && !perms.includes("users.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/audit-logs") && !perms.includes("audit.view")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      (pathname.startsWith("/admin/services") ||
        pathname.startsWith("/admin/landings") ||
        pathname.startsWith("/admin/blog")) &&
      !perms.some(p => p.startsWith("services."))
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/partners") && !perms.some(p => p.startsWith("partners."))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/rent") && !perms.includes("rent.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Старые cookie могли быть выданы до появления sell.manage.
    // API всё равно проверит актуальные права из БД, поэтому для входа в раздел
    // достаточно services.manage или роли администратора.
    const canOpenSell =
      perms.includes("sell.manage") ||
      perms.includes("services.manage") ||
      user.role === "Администратор";
    if (pathname.startsWith("/admin/sell") && !canOpenSell) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/contacts") && !perms.includes("contacts.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Заявки/клиенты/задачи: доступ даёт любое право на работу с заявками,
    // а серверный API сам отфильтрует источники по правам.
    const canSeeLeads =
      perms.includes("contacts.manage") ||
      perms.includes("rent.manage") ||
      perms.includes("sell.manage") ||
      perms.some(permission => permission.startsWith("autopodbor."));
    if (
      (pathname.startsWith("/admin/requests") ||
        pathname.startsWith("/admin/clients") ||
        pathname.startsWith("/admin/tasks")) &&
      !canSeeLeads
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      (pathname.startsWith("/admin/analytics") ||
        pathname.startsWith("/admin/monitoring") ||
        pathname.startsWith("/admin/notifications")) &&
      !perms.includes("audit.view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/email") && !perms.includes("email.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      pathname.startsWith("/admin/promotion") &&
      !perms.includes("services.manage") &&
      !perms.includes("audit.view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      (pathname.startsWith("/admin/inspection") || pathname.startsWith("/admin/reports")) &&
      !perms.includes("autopodbor.manage") &&
      !perms.includes("autopodbor.view") &&
      !perms.includes("autopodbor.requests")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/services/:path*", "/blog/:path*", "/works/:path*", "/api/rent/requests/:path*", "/api/contact", "/api/express-check", "/api/autopodbor/leads/:path*", "/api/sell/requests/:path*"] };
