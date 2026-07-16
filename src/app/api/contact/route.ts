import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      message?: string;
    };

    if (!body.name || !body.message) {
      return NextResponse.json(
        { ok: false, error: "name and message are required" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { ok: true, data: { received: true } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 },
    );
  }
}
