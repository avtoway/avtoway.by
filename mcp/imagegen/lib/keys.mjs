import { env } from "./env.mjs";
import { MissingKeyError } from "./errors.mjs";

/**
 * Возвращает ключ провайдера из env/.env.
 * Если ключа нет — кидает MissingKeyError с инструкцией, где его взять.
 */
export function requireKey(model) {
  if (!model?.keyEnv) return null;
  const value = env(model.keyEnv);
  if (!value) {
    throw new MissingKeyError(
      model.keyEnv,
      model.keyUrl ?? "https://opencode.ai",
      model.label ?? model.provider ?? "провайдера",
    );
  }
  return value;
}
