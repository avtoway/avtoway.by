import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyLogin, signTokenFromUser } from "@/lib/auth.server";

export async function POST(request: Request) {
  try {
    const { login, password } = (await request.json()) as { login?: string; password?: string };

    if (!login || !password) {
      return NextResponse.json({ ok: false, error: "Логин и пароль обязательны" }, { status: 400 });
    }

    const user = await verifyLogin(login, password, bcrypt);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Неверный логин или пароль" }, { status: 401 });
    }

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
