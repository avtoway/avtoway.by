/** Ошибка «нет ключа провайдера» — самая частая у новичков. */
export class MissingKeyError extends Error {
  constructor(keyEnv, keyUrl, providerLabel) {
    super(
      `Не задан ключ ${keyEnv} для ${providerLabel}.\n` +
        `1) Получи ключ: ${keyUrl}\n` +
        `2) Добавь строку в файл mcp/imagegen/.env:\n   ${keyEnv}=твой_ключ\n` +
        `3) Перезапусти OpenCode (MCP-сервер читает .env при старте).`,
    );
    this.name = "MissingKeyError";
    this.keyEnv = keyEnv;
    this.keyUrl = keyUrl;
  }
}

/** Провайдер ответил ошибкой или вернул пустой результат. */
export class ProviderError extends Error {
  constructor(provider, message, { status, body, url } = {}) {
    const details = [];
    if (status) details.push(`HTTP ${status}`);
    if (url) details.push(url);
    const suffix = details.length ? ` (${details.join(", ")})` : "";
    super(`${provider}: ${message}${suffix}`);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

/** Неверные параметры вызова инструмента. */
export class ValidationError extends Error {
  constructor(message, { hint } = {}) {
    super(hint ? `${message}\n${hint}` : message);
    this.name = "ValidationError";
    this.hint = hint;
  }
}

export function errorToText(error) {
  if (error instanceof MissingKeyError) {
    return `Нет ключа API.\n\n${error.message}`;
  }
  if (error instanceof ProviderError) {
    const body = error.body ? `\nОтвет провайдера: ${String(error.body).slice(0, 1200)}` : "";
    return `Ошибка генерации.\n\n${error.message}${body}`;
  }
  if (error instanceof ValidationError) {
    return `Неверные параметры.\n\n${error.message}`;
  }
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return "Превышено время ожидания. Модель не ответила вовремя — попробуй ещё раз или выбери более быструю (flux-schnell / imagen-4-fast).";
  }
  return `Внутренняя ошибка MCP-сервера imagegen: ${error?.message || String(error)}`;
}
