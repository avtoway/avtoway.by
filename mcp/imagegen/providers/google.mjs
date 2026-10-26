import { requireKey } from "../lib/keys.mjs";
import { fetchJson } from "../lib/http.mjs";
import { ProviderError } from "../lib/errors.mjs";

export const name = "google";

/** Imagen 4 поддерживает только фиксированный набор соотношений. */
const ASPECT_MAP = {
  "1:1": "1:1",
  "4:3": "4:3",
  "3:2": "4:3",
  "16:9": "16:9",
  "21:9": "16:9",
  "3:4": "3:4",
  "2:3": "3:4",
  "9:16": "9:16",
};

export async function generate({ model, prompt, aspect, count }) {
  const key = requireKey(model);

  const { json } = await fetchJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${model.apiModel}:predict?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: count,
          aspectRatio: ASPECT_MAP[aspect] ?? "1:1",
        },
      }),
      provider: "google",
      timeoutMs: 180_000,
      retries: 1,
    },
  );

  const predictions = json.predictions ?? [];
  const images = predictions
    .map((prediction) => prediction.bytesBase64Encoded)
    .filter(Boolean)
    .map((base64) => ({ base64, mimeType: "image/png" }));

  if (!images.length) {
    const reason = json.error?.message ?? "ответ без изображений (возможно, сработал фильтр безопасности)";
    throw new ProviderError("google", reason, { body: JSON.stringify(json).slice(0, 800) });
  }

  return { images, extra: { aspect: ASPECT_MAP[aspect] ?? "1:1" } };
}
