"use client";

export function reportClientError(
  error: unknown,
  source = "client",
  details?: string,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  void fetch("/api/monitoring/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      level: "error",
      source,
      message: message.slice(0, 2000),
      details: [stack, details].filter(Boolean).join("\n\n").slice(0, 10000),
    }),
  }).catch(() => { /* мониторинг не должен ломать интерфейс */ });
}
