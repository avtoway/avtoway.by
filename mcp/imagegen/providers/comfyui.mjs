import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { env, JOB_TIMEOUT_MS } from "../lib/env.mjs";
import { downloadBuffer, fetchJson, poll } from "../lib/http.mjs";
import { ProviderError, ValidationError } from "../lib/errors.mjs";

export const name = "comfyui";

const DEFAULT_URL = "http://127.0.0.1:8188";

function baseUrl() {
  return env("COMFYUI_URL", DEFAULT_URL).replace(/\/+$/, "");
}

/** Встроенный workflow для SDXL-чекпойнта. */
function sdxlWorkflow({ prompt, negative, width, height, seed, steps, cfg }) {
  return {
    3: {
      class_type: "KSampler",
      inputs: {
        seed,
        steps,
        cfg,
        sampler_name: "dpmpp_2m",
        scheduler: "karras",
        denoise: 1,
        model: ["4", 0],
        positive: ["6", 0],
        negative: ["7", 0],
        latent_image: ["5", 0],
      },
    },
    4: {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: env("COMFYUI_CHECKPOINT", "sd_xl_base_1.0.safetensors") },
    },
    5: { class_type: "EmptyLatentImage", inputs: { width, height, batch_size: 1 } },
    6: { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["4", 1] } },
    7: { class_type: "CLIPTextEncode", inputs: { text: negative || "", clip: ["4", 1] } },
    8: { class_type: "VAEDecode", inputs: { samples: ["3", 0], vae: ["4", 2] } },
    9: { class_type: "SaveImage", inputs: { filename_prefix: "imagegen", images: ["8", 0] } },
  };
}

/** Кастомный workflow из файла: подставляем {{PROMPT}}, {{NEGATIVE}}, {{WIDTH}}, {{HEIGHT}}, {{SEED}}. */
async function customWorkflow(path, { prompt, negative, width, height, seed }) {
  const text = await readFile(path, "utf8");
  const replaced = text
    .replaceAll("{{PROMPT}}", JSON.stringify(prompt).slice(1, -1))
    .replaceAll("{{NEGATIVE}}", JSON.stringify(negative || "").slice(1, -1))
    .replaceAll("{{WIDTH}}", String(width))
    .replaceAll("{{HEIGHT}}", String(height))
    .replaceAll("{{SEED}}", String(seed));
  try {
    return JSON.parse(replaced);
  } catch (error) {
    throw new ValidationError(`Не удалось разобрать workflow ${path}: ${error.message}`);
  }
}

export async function generate({ model, prompt, negative, width, height, count, seed }) {
  const base = baseUrl();
  const images = [];

  for (let index = 0; index < count; index += 1) {
    const actualSeed = (seed ?? Math.floor(Math.random() * 1_000_000)) + index;
    const workflowPath = model.apiModel === "flux"
      ? env("COMFYUI_FLUX_WORKFLOW")
      : env("COMFYUI_WORKFLOW");

    let graph;
    if (workflowPath) {
      graph = await customWorkflow(workflowPath, {
        prompt,
        negative,
        width,
        height,
        seed: actualSeed,
      });
    } else if (model.apiModel === "flux") {
      throw new ValidationError(
        "Для local-flux нужен файл workflow.\n" +
          "1) Открой ComfyUI, собери FLUX-пайплайн\n" +
          "2) Workflow → Export (API) → сохрани JSON\n" +
          "3) Пропиши путь: COMFYUI_FLUX_WORKFLOW=C:\\path\\flux-api.json в mcp/imagegen/.env",
      );
    } else {
      graph = sdxlWorkflow({
        prompt,
        negative,
        width,
        height,
        seed: actualSeed,
        steps: Number(env("COMFYUI_STEPS", "28")),
        cfg: Number(env("COMFYUI_CFG", "7")),
      });
    }

    const { json } = await fetchJson(`${base}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: graph, client_id: randomUUID() }),
      provider: "comfyui",
      timeoutMs: 30_000,
      retries: 0,
    });

    const promptId = json.prompt_id;
    if (!promptId) {
      throw new ProviderError("comfyui", "не принял workflow", {
        body: JSON.stringify(json).slice(0, 800),
        url: `${base}/prompt`,
      });
    }

    const outputImages = await poll(
      async () => {
        const { json: history } = await fetchJson(`${base}/history/${promptId}`, {
          provider: "comfyui",
          timeoutMs: 30_000,
          retries: 0,
        });
        const entry = history[promptId];
        if (!entry) return null;
        if (entry.status?.status_str === "error") {
          throw new ProviderError("comfyui", "workflow завершился ошибкой", {
            body: JSON.stringify(entry.status).slice(0, 1200),
          });
        }
        const images = Object.values(entry.outputs ?? {}).flatMap((output) => output.images ?? []);
        return images.length ? images : null;
      },
      { timeoutMs: JOB_TIMEOUT_MS, intervalMs: 1500, label: "ComfyUI" },
    );

    const image = outputImages[0];
    const url = `${base}/view?filename=${encodeURIComponent(image.filename)}&subfolder=${encodeURIComponent(image.subfolder ?? "")}&type=${encodeURIComponent(image.type ?? "output")}`;
    images.push({ buffer: await downloadBuffer(url), mimeType: "image/png" });
  }

  return { images, extra: { local: true, seed: seed ?? null } };
}

export async function systemStats() {
  try {
    const { json } = await fetchJson(`${baseUrl()}/system_stats`, {
      provider: "comfyui",
      timeoutMs: 2500,
      retries: 0,
    });
    return { online: true, url: baseUrl(), devices: json.devices?.length ?? null };
  } catch (error) {
    return { online: false, url: baseUrl(), error: error.message };
  }
}
