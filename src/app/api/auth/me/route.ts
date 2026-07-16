import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth.server";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    data: { id: user.id, login: user.login, name: user.name, photo: user.photo, role: user.role, permissions: user.permissions },
  });
}
