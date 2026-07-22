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

export function toApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json({ ok: false, error: error.message }, { status: error.statusCode });
  }
  const message = error instanceof Error ? error.message : "Внутренняя ошибка сервера";
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
