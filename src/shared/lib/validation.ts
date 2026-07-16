import { NextResponse } from "next/server";
import { type ZodSchema } from "zod";

type Validated<T> = { validated: true; data: T };

export function validateOrResponse<T>(schema: ZodSchema<T>, data: unknown): Validated<T> | NextResponse {
  const result = schema.safeParse(data);
  if (result.success) return { validated: true as const, data: result.data };
  const firstError = result.error.issues[0];
  return NextResponse.json({ ok: false, error: firstError?.message ?? "Неверный запрос" }, { status: 400 });
}
