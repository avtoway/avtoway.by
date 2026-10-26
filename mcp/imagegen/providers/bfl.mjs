import { requireKey } from "../lib/keys.mjs";
import { fetchJson, poll } from "../lib/http.mjs";
import { ProviderError } from "../lib/errors.mjs";
import { JOB_TIMEOUT_MS } from "../lib/env.mjs";

export const name = "bfl";

/**
 * Black Forest Labs: задача создаётся, потом опрашивается polling_url.
 * FLUX Pro/Dev принимают width/height, Ultra — aspect_ratio.
 */
export async function generate({ model, prompt, aspect, width, height, count, seed }) {
  const key = requireKey(model);

  // BFL отдаёт по одному изображению на задачу.
  const batch = Math.min(count, 1);
  const results = [];

  for (let index = 0; index < batch; index += 1) {
    const body = { prompt, output_format: "png", safety_tolerance: 2 };
    if (model.sizeMode === "aspect") body.aspect_ratio = aspect;
    else {
      body.width = width;
      body.height = height;
    }
    if (seed !== undefined && seed !== null) body.seed = seed + index;

    const { json } = await fetchJson(`https://api.bfl.ai/v1/${model.apiModel}`, {
      method: "POST",
      headers: {
        "x-key": key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      provider: "bfl",
      timeoutMs: 60_000,
      retries: 1,
    });

    if (!json.polling_url) {
      throw new ProviderError("bfl", "не вернул polling_url", { body: JSON.stringify(json) });
    }

    const ready = await poll(
      async () => {
        const { json: status } = await fetchJson(json.polling_url, {
          headers: { "x-key": key, Accept: "application/json" },
          provider: "bfl",
          timeoutMs: 30_000,
          retries: 1,
        });
        if (status.status === "Ready") return status;
        if (["Error", "Failed", "Content Moderated", "Request Moderated"].includes(status.status)) {
          throw new ProviderError("bfl", `задача завершилась со статусом ${status.status}`, {
            body: JSON.stringify(status).slice(0, 800),
          });
        }
        return null;
      },
      { timeoutMs: JOB_TIMEOUT_MS, intervalMs: 1500, label: "BFL FLUX" },
    );

    const sample = ready.result?.sample;
    if (!sample) throw new ProviderError("bfl", "нет ссылки на результат", { body: JSON.stringify(ready) });
    results.push({ url: sample, mimeType: "image/png" });
  }

  return {
    images: results,
    extra: { seed: seed ?? null, async: true },
  };
}
