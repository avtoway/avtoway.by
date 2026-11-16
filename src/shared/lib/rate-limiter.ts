const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/** Предохранитель от переполнения памяти при флуде с множества ключей. */
const MAX_ENTRIES = 10_000;
const SWEEP_INTERVAL_MS = 60_000;
let lastSweepAt = 0;

function sweep(now: number): void {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS && attempts.size <= MAX_ENTRIES) return;
  lastSweepAt = now;

  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }

  if (attempts.size > MAX_ENTRIES) {
    let overflow = attempts.size - MAX_ENTRIES;
    for (const key of attempts.keys()) {
      attempts.delete(key);
      if (--overflow <= 0) break;
    }
  }
}

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
  sweep(now);

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
