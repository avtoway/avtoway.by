import { requireKey } from "../lib/keys.mjs";
import { fetchJson } from "../lib/http.mjs";
import { ProviderError } from "../lib/errors.mjs";

export const name = "fal";

const RECRAFT_PRESETS = {
  "1:1": "square_hd",
  "4:3": "landscape_4_3",
  "3:2": "landscape_4_3",
  "16:9": "landscape_16_9",
  "21:9": "landscape_16_9",
  "3:4": "portrait_4_3",
  "2:3": "portrait_4_3",
  "9:16": "portrait_16_9",
};

export async function generate({ model, prompt, negative, aspect, width, height, count, seed }) {
  const key = requireKey(model);
  const body = { prompt };

  if (model.apiModel === "fal-ai/recraft-v3") {
    // Recraft принимает только пресеты размера — без num_images/seed/output_format.
    body.image_size = RECRAFT_PRESETS[aspect] ?? "square_hd";
  } else {
    body.num_images = count;
    body.output_format = "png";
    body.enable_safety_checker = true;

    if (model.sizeMode === "aspect") {
      body.aspect_ratio = aspect;
    } else if (model.sizeMode === "preset") {
      body.image_size = RECRAFT_PRESETS[aspect] ?? "square_hd";
    } else {
      body.image_size = { width, height };
    }

    if (seed !== undefined && seed !== null) body.seed = seed;
    if (negative && model.supports.negative) body.negative_prompt = negative;
  }

  const { json } = await fetchJson(`https://fal.run/${model.apiModel}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    provider: "fal",
    timeoutMs: 240_000,
    retries: 1,
  });

  const images = (json.images ?? []).map((image) => ({
    url: image.url,
    mimeType: image.content_type ?? "image/png",
    width: image.width,
    height: image.height,
  }));

  if (!images.length) {
    throw new ProviderError("fal", "ответ без изображений", {
      url: `https://fal.run/${model.apiModel}`,
      body: JSON.stringify(json).slice(0, 800),
    });
  }

  return {
    images,
    extra: {
      seed: json.seed ?? seed ?? null,
      requestId: json.request_id ?? null,
      sizeMode: model.sizeMode,
    },
  };
}
