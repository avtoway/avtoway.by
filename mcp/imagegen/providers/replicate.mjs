import { requireKey } from "../lib/keys.mjs";
import { fetchJson, poll } from "../lib/http.mjs";
import { ProviderError } from "../lib/errors.mjs";
import { JOB_TIMEOUT_MS } from "../lib/env.mjs";

export const name = "replicate";

function normalizeOutput(output) {
  const list = Array.isArray(output) ? output : [output];
  return list
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && typeof item.url === "string") return item.url;
      if (item && typeof item === "object" && typeof item.href === "string") return item.href;
      return null;
    })
    .filter(Boolean);
}

export async function generate({ model, prompt, aspect, count, seed }) {
  const key = requireKey(model);

  const { json } = await fetchJson(
    `https://api.replicate.com/v1/models/${model.apiModel}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          prompt,
          aspect_ratio: aspect,
          output_format: "png",
          num_outputs: count,
          ...(seed !== undefined && seed !== null ? { seed } : {}),
        },
      }),
      provider: "replicate",
      timeoutMs: 120_000,
      retries: 1,
    },
  );

  let prediction = json;

  if (prediction.status !== "succeeded") {
    if (["failed", "canceled"].includes(prediction.status)) {
      throw new ProviderError("replicate", prediction.error ?? "задача завершилась ошибкой", {
        body: JSON.stringify(prediction).slice(0, 800),
      });
    }
    prediction = await poll(
      async () => {
        const { json: current } = await fetchJson(prediction.urls.get, {
          headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
          provider: "replicate",
          timeoutMs: 30_000,
          retries: 1,
        });
        if (current.status === "succeeded") return current;
        if (["failed", "canceled"].includes(current.status)) {
          throw new ProviderError("replicate", current.error ?? "задача завершилась ошибкой", {
            body: JSON.stringify(current).slice(0, 800),
          });
        }
        return null;
      },
      { timeoutMs: JOB_TIMEOUT_MS, intervalMs: 2000, label: "Replicate" },
    );
  }

  const images = normalizeOutput(prediction.output).map((url) => ({ url, mimeType: "image/png" }));
  if (!images.length) {
    throw new ProviderError("replicate", "ответ без изображений", {
      body: JSON.stringify(prediction).slice(0, 800),
    });
  }

  return { images, extra: { seed: seed ?? null, predictionId: prediction.id } };
}
