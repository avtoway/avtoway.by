import "@/di/composition-root";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/infrastructure/persistence/prisma.client";
import { randomUUID } from "node:crypto";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!body.name || !body.slug) {
    return NextResponse.json({ ok: false, error: "Название и slug обязательны" }, { status: 400 });
  }
  const db = getPrismaClient();
  const existing = await db.rentType.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ ok: false, error: "Такой slug уже существует" }, { status: 409 });
  }
  const type = await db.rentType.create({
    data: { id: randomUUID(), name: body.name, slug: body.slug, sortOrder: body.sortOrder ?? 0 },
  });
  return NextResponse.json({ ok: true, data: type }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "id обязателен" }, { status: 400 });
  const db = getPrismaClient();
  await db.rentType.delete({ where: { id } });
  return NextResponse.json({ ok: true, data: { deleted: id } });
}
