import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { requireKey } from "../lib/keys.mjs";
import { fetchJson } from "../lib/http.mjs";
import { ProviderError, ValidationError } from "../lib/errors.mjs";

export const name = "openai";

const MIME_BY_EXT = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

function sizeFor(aspect) {
  if (aspect === "1:1") return "1024x1024";
  if (["9:16", "3:4", "2:3"].includes(aspect)) return "1024x1536";
  return "1536x1024";
}

function parseImages(json) {
  return (json.data ?? [])
    .map((item) => {
      if (item.b64_json) return { base64: item.b64_json, mimeType: "image/png" };
      if (item.url) return { url: item.url, mimeType: "image/png" };
      return null;
    })
    .filter(Boolean);
}

export async function generate({ model, prompt, aspect, count, quality }) {
  const key = requireKey(model);

  const { json } = await fetchJson("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.apiModel,
      prompt,
      n: Math.min(count, 4),
      size: sizeFor(aspect),
      quality: quality ?? "medium",
      output_format: "png",
    }),
    provider: "openai",
    timeoutMs: 240_000,
    retries: 1,
  });

  const images = parseImages(json);
  if (!images.length) {
    throw new ProviderError("openai", json.error?.message ?? "ответ без изображений", {
      body: JSON.stringify(json).slice(0, 800),
    });
  }

  return { images, extra: { size: sizeFor(aspect), quality: quality ?? "medium" } };
}

/**
 * Редактирование существующей картинки (только gpt-image-1).
 * imagePath — локальный путь или https-URL.
 */
export async function edit({ model, prompt, imagePath, aspect, quality, count }) {
  const key = requireKey(model);

  const form = new FormData();
  form.append("model", model.apiModel);
  form.append("prompt", prompt);
  form.append("n", String(Math.min(count ?? 1, 4)));
  form.append("size", sizeFor(aspect ?? "1:1"));
  if (quality) form.append("quality", quality);

  if (/^https?:\/\//i.test(imagePath)) {
    const response = await fetch(imagePath, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) throw new ValidationError(`Не удалось скачать исходное изображение: HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const mime = response.headers.get("content-type")?.split(";")[0] || "image/png";
    form.append("image", new Blob([buffer], { type: mime }), "source.png");
  } else {
    const buffer = await readFile(imagePath);
    const mime = MIME_BY_EXT[extname(imagePath).toLowerCase()] ?? "image/png";
    form.append("image", new Blob([buffer], { type: mime }), `source${extname(imagePath) || ".png"}`);
  }

  const { json } = await fetchJson("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
    provider: "openai",
    timeoutMs: 240_000,
    retries: 1,
  });

  const images = parseImages(json);
  if (!images.length) {
    throw new ProviderError("openai", json.error?.message ?? "ответ без изображений", {
      body: JSON.stringify(json).slice(0, 800),
    });
  }
  return { images, extra: { mode: "edit", source: imagePath } };
}
