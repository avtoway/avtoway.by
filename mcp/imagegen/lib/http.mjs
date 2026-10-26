import { ProviderError } from "./errors.mjs";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * fetch с таймаутом, повторами на 429/5xx и понятной ошибкой.
 * Возвращает Response (ok === true).
 */
export async function request(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 240_000,
    retries = 2,
    provider = "http",
  } = options;

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (response.ok) return response;

      const text = await response.text().catch(() => "");
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1500 * (attempt + 1);
        await sleep(waitMs);
        lastError = new ProviderError(provider, "сервер перегружен, повтор запроса", {
          status: response.status,
          body: text,
          url,
        });
        continue;
      }

      throw new ProviderError(provider, "запрос отклонён", {
        status: response.status,
        body: text,
        url,
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        if (attempt < retries && error.status === undefined) {
          lastError = error;
          await sleep(1000 * (attempt + 1));
          continue;
        }
        throw error;
      }
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        if (attempt < retries) {
          lastError = error;
          continue;
        }
        throw new ProviderError(provider, "таймаут запроса", { url });
      }
      if (attempt < retries) {
        lastError = error;
        await sleep(800 * (attempt + 1));
        continue;
      }
      throw new ProviderError(provider, error?.message || "сетевая ошибка", { url });
    }
  }
  throw lastError ?? new ProviderError(provider, "неизвестная ошибка", { url });
}

export async function fetchJson(url, options = {}) {
  const response = await request(url, options);
  const text = await response.text();
  try {
    return { json: text ? JSON.parse(text) : {}, response };
  } catch {
    throw new ProviderError(options.provider || "http", "ответ не является JSON", {
      url,
      body: text.slice(0, 800),
    });
  }
}

export async function downloadBuffer(url, { timeoutMs = 180_000 } = {}) {
  const response = await request(url, { timeoutMs, retries: 2, provider: "download" });
  return Buffer.from(await response.arrayBuffer());
}

/** Опрос асинхронной задачи, пока fn не вернёт не-null. */
export async function poll(fn, { timeoutMs = 300_000, intervalMs = 2000, label = "задача" } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await fn();
    if (result) return result;
    await sleep(intervalMs);
  }
  throw new ProviderError("poll", `не дождались результата (${label}, ${Math.round(timeoutMs / 1000)} с)`);
}
