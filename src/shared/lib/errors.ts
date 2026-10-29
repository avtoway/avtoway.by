import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthError extends AppError {
  constructor(message = "Не авторизован") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Доступ запрещён") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Не найдено") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

function logServerError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[api]", error);
  void import("@/infrastructure/persistence/prisma.client")
    .then(({ getPrismaClient }) => getPrismaClient().systemEvent.create({
      data: {
        level: "error",
        source: "api",
        message: message.slice(0, 2000),
        details: error instanceof Error ? error.stack?.slice(0, 10000) : undefined,
      },
    }))
    .catch(() => { /* журнал не должен ломать ответ */ });
}

export function toApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    if (error.statusCode >= 500) logServerError(error);
    return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode });
  }
  const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера";
  logServerError(error);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
