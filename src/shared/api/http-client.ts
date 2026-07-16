import "server-only";
import type { ApiResult } from "@/shared/types/api";

interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
}

export class HttpClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config: HttpClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 10_000;
    this.retries = config.retries ?? 3;
  }

  async get<T>(
    path: string,
    init?: RequestInit,
  ): Promise<ApiResult<T>> {
    const url = `${this.baseURL}${path}`;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        const res = await fetch(url, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (!res.ok) {
          return {
            ok: false,
            error: {
              code: "SERVER",
              status: res.status,
              message: `HTTP ${res.status}: ${res.statusText}`,
            },
          };
        }

        const data = (await res.json()) as T;
        return { ok: true, data };
      } catch (err) {
        if (attempt === this.retries) {
          const isTimeout = err instanceof DOMException && err.name === "AbortError";
          return {
            ok: false,
            error: {
              code: isTimeout ? "TIMEOUT" : "NETWORK",
              message: isTimeout
                ? `Request timed out after ${this.timeout}ms`
                : (err as Error).message,
            },
          };
        }
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 2 ** attempt * 200));
      }
    }

    return {
      ok: false,
      error: { code: "NETWORK", message: "Max retries exceeded" },
    };
  }
}
