import { createHmac, timingSafeEqual } from "node:crypto";

/** Время жизни сессии: 24 часа. */
export const TOKEN_TTL_SECONDS = 60 * 60 * 24;

export interface TokenPayload {
  id: string;
  name: string;
  role: string;
  permissions: string[];
  /** Unix-время истечения токена (секунды). */
  exp: number;
}

function requiresSecret(): boolean {
  return process.env.NODE_ENV === "production";
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value === "dev-secret") {
    if (requiresSecret()) {
      // Fail closed: без нормального секрета сессии в production не подписываем и не проверяем токены.
      throw new Error("AUTH_SECRET не задан или равен значению по умолчанию — вход в production заблокирован");
    }
    return "dev-secret";
  }
  return value;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function signToken(payload: Omit<TokenPayload, "exp">): string {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyToken(token: string): TokenPayload | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;

  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!body || !signature) return null;

  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return null;
  }
  if (!safeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as Partial<TokenPayload>;
    if (typeof parsed?.id !== "string" || typeof parsed?.exp !== "number") return null;
    if (!Array.isArray(parsed.permissions) || typeof parsed.role !== "string") return null;
    if (parsed.exp * 1000 <= Date.now()) return null;
    return {
      id: parsed.id,
      name: typeof parsed.name === "string" ? parsed.name : "",
      role: parsed.role,
      permissions: parsed.permissions.filter((permission): permission is string => typeof permission === "string"),
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}
