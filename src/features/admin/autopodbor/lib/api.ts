export interface ApiResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** GET JSON без исключений: сетевые ошибки возвращают null. */
export async function getJson<T = unknown>(url: string): Promise<ApiResult<T> | null> {
  try {
    const response = await fetch(url);
    return (await response.json()) as ApiResult<T>;
  } catch {
    return null;
  }
}

/** POST/PUT/PATCH/DELETE JSON без исключений. */
export async function sendJson<T = unknown>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<{ status: number; result: ApiResult<T> | null }> {
  try {
    const response = await fetch(url, {
      method,
      ...(body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const result = (await response.json().catch(() => null)) as ApiResult<T> | null;
    return { status: response.status, result };
  } catch {
    return { status: 0, result: null };
  }
}
