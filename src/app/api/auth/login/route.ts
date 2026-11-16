import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyLogin, signTokenFromUser } from "@/lib/auth.server";
import { checkRateLimit, resetRateLimit } from "@/shared/lib/rate-limiter";

/** Попытки входа: 8 неудачных за 15 минут на пару IP + логин. */
const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: Request): string {
  // На VPS за nginx сюда приходит реальный IP; при прямом доступе заголовок можно подделать.
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

function rateLimitKey(request: Request, login: string): string {
  return `login:${clientIp(request)}:${login.toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { login?: unknown; password?: unknown };
    const login = typeof body.login === "string" ? body.login.trim().slice(0, 100) : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!login || !password) {
      return NextResponse.json({ ok: false, error: "Логин и пароль обязательны" }, { status: 400 });
    }

    const key = rateLimitKey(request, login);
    if (!checkRateLimit(key, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { ok: false, error: "Слишком много попыток входа. Попробуйте через 15 минут." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(LOGIN_WINDOW_MS / 1000)) } },
      );
    }

    const user = await verifyLogin(login, password, bcrypt);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 });
    }

    // Успешный вход сбрасывает счётчик неудачных попыток.
    resetRateLimit(key);

    const token = await signTokenFromUser(user);
    const response = NextResponse.json({ ok: true, data: { name: user.name, role: user.role } });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ ok: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
