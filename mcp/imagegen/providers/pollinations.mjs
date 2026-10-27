import { ProviderError } from "../lib/errors.mjs";

/**
 * Бесплатный FLUX через Pollinations.
 * Не требует API-ключа — подходит для черновиков и атмосферных фото.
 * Сейчас classic API может требовать pollen key: https://enter.pollinations.ai
 */
export const name = "pollinations";

const TIMEOUT_MS = 300_000;
const ATTEMPTS = 3;

async function download(url) {
  let lastError = "не удалось получить изображение";

  for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      lastError = error?.message || String(error);
      if (attempt < ATTEMPTS) await new Promise(resolve => setTimeout(resolve, 2_000 * attempt));
      continue;
    }

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 1024) {
        lastError = "пустой ответ";
      } else {
        return {
          buffer,
          mimeType: response.headers.get("content-type") ?? "image/jpeg",
        };
      }
    } else if (response.status === 402) {
      throw new ProviderError(
        "pollinations",
        "нужен pollen key или оплата (получите ключ на https://enter.pollinations.ai)",
        { status: 402, url },
      );
    } else {
      lastError = `HTTP ${response.status}`;
    }

    if (attempt < ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, 2_000 * attempt));
    }
  }

  throw new ProviderError("pollinations", lastError, { url });
}

export async function generate({ model, prompt, width, height, count, seed }) {
  const images = [];
  const baseSeed = Number.isFinite(seed) ? seed : 1;

  for (let index = 0; index < count; index += 1) {
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      model: model.apiModel || "flux",
      nologo: "true",
      enhance: "false",
      referrer: "avtoway.by",
      seed: String(baseSeed + index),
    });
    if (process.env.POLLINATIONS_TOKEN) {
      params.set("token", process.env.POLLINATIONS_TOKEN);
    }

    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
    images.push(await download(url));
  }

  return {
    images,
    extra: { seed: baseSeed, provider: "pollinations" },
  };
}
