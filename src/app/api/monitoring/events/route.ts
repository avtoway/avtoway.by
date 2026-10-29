import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { requireAuth } from "@/lib/auth.server";
import { toApiError } from "@/shared/lib/errors";
import { checkRateLimit } from "@/shared/lib/rate-limiter";

export async function GET(request: Request) {
  try {
    await requireAuth("audit.view");
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? 100) || 100, 500);
    const level = searchParams.get("level") ?? "";
    const events = await getPrismaClient().systemEvent.findMany({
      where: level ? { level } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json({ ok: true, data: events });
  } catch (error) {
    return toApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(`monitoring:${ip}`, 20, 60_000)) {
      return NextResponse.json({ ok: false, error: "Слишком много событий" }, { status: 429 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      level?: string;
      source?: string;
      message?: string;
      details?: string;
    };
    const message = body.message?.trim().slice(0, 2000);
    if (!message) return NextResponse.json({ ok: false, error: "Нет текста события" }, { status: 400 });

    const event = await getPrismaClient().systemEvent.create({
      data: {
        level: (body.level ?? "error").trim().slice(0, 20),
        source: (body.source ?? "client").trim().slice(0, 100),
        message,
        details: body.details?.trim().slice(0, 10000) || null,
      },
    });
    return NextResponse.json({ ok: true, data: { id: event.id } }, { status: 201 });
  } catch (error) {
    return toApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAuth("audit.view");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const db = getPrismaClient();
    if (id) await db.systemEvent.delete({ where: { id } });
    else await db.systemEvent.deleteMany();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return toApiError(error);
  }
}
