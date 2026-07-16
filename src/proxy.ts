import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/shared/lib/rate-limiter";
import { verifyToken } from "@/lib/auth.server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login") && request.method === "POST") {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(`login:${ip}`)) {
      return NextResponse.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
    }
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
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
