import { requireKey } from "../lib/keys.mjs";
import { fetchJson } from "../lib/http.mjs";
import { ProviderError } from "../lib/errors.mjs";

export const name = "ideogram";

const ASPECT_MAP = {
  "1:1": "1x1",
  "4:3": "4x3",
  "3:2": "3x2",
  "16:9": "16x9",
  "21:9": "21x9",
  "3:4": "3x4",
  "2:3": "2x3",
  "9:16": "9x16",
};

const SPEED_MAP = {
  low: "TURBO",
  medium: "DEFAULT",
  high: "QUALITY",
};

export async function generate({ model, prompt, negative, aspect, count, seed, quality }) {
  const key = requireKey(model);
  const images = [];

  // Ideogram v3 отдаёт одно изображение за запрос — остальные добираем циклом.
  for (let index = 0; index < count; index += 1) {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("aspect_ratio", ASPECT_MAP[aspect] ?? "1x1");
    form.append("rendering_speed", SPEED_MAP[quality] ?? "DEFAULT");
    if (negative) form.append("negative_prompt", negative);
    if (seed !== undefined && seed !== null) form.append("seed", String(seed + index));

    const { json } = await fetchJson("https://api.ideogram.ai/v1/ideogram-v3/generate", {
      method: "POST",
      headers: { "Api-Key": key, Accept: "application/json" },
      body: form,
      provider: "ideogram",
      timeoutMs: 240_000,
      retries: 1,
    });

    const batch = (json.data ?? [])
      .map((item) => item.url)
      .filter(Boolean)
      .map((url) => ({ url, mimeType: "image/png" }));
    if (!batch.length) {
      throw new ProviderError("ideogram", "ответ без изображений", {
        body: JSON.stringify(json).slice(0, 800),
      });
    }
    images.push(...batch);
  }

  return { images, extra: { aspect: ASPECT_MAP[aspect] ?? "1x1", renderingSpeed: SPEED_MAP[quality] ?? "DEFAULT" } };
}
