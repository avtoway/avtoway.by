import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { verifyToken } from "@/lib/auth.server";

function clientIp(request: NextRequest): string {
  // На VPS за nginx сюда приходит реальный IP; при прямом доступе заголовок можно подделать
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login") && request.method === "POST") {
    const ip = clientIp(request);
    if (!checkRateLimit(`login:${ip}`)) {
      return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
    }
  }

  // Публичные формы: защита от спама/флуда (лиды автоподбора — 5/10 мин, остальные — 10/10 мин)
  const isAutoPodborLead = pathname === "/api/autopodbor/leads";
  const isPublicWrite =
    request.method === "POST" &&
    (pathname === "/api/rent/requests" || pathname === "/api/contact" || isAutoPodborLead);
  if (isPublicWrite && !checkRateLimit(
    `public:${pathname}:${clientIp(request)}`,
    isAutoPodborLead ? 5 : 10,
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

    if (pathname.startsWith("/admin/services") && !perms.some(p => p.startsWith("services."))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/partners") && !perms.some(p => p.startsWith("partners."))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/rent") && !perms.includes("rent.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/contacts") && !perms.includes("contacts.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/requests") && !perms.includes("contacts.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (pathname.startsWith("/admin/email") && !perms.includes("email.manage")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
      pathname.startsWith("/admin/inspection") &&
      !perms.includes("autopodbor.manage") &&
      !perms.includes("autopodbor.view")
    ) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/api/rent/requests/:path*", "/api/contact", "/api/autopodbor/leads/:path*"] };
