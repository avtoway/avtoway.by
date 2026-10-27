const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Простой in-memory rate limit.
 * Для нескольких инстансов нужен общий store (Redis), но для одного VPS хватает.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = MAX_ATTEMPTS,
  windowMs = WINDOW_MS,
): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    return false;
  }

  entry.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
