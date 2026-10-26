import { downloadBuffer } from "./http.mjs";
import { ValidationError } from "./errors.mjs";
import { ASPECTS, getModel, MODEL_IDS } from "./catalog.mjs";
import { getProvider } from "../providers/index.mjs";
import { defaultBaseName, saveImages } from "./storage.mjs";
import { env } from "./env.mjs";

const MIN_SIDE = 256;
const MAX_SIDE = 2048;
const DEFAULT_MEGAPIXELS = Number(env("IMAGEGEN_MEGAPIXELS", "1.0"));

function roundTo16(value) {
  return Math.max(MIN_SIDE, Math.min(MAX_SIDE, Math.round(value / 16) * 16));
}

export function dimensionsFor(aspect, maxMegapixels = 2) {
  const [rawWidth, rawHeight] = String(aspect).split(":").map(Number);
  if (!rawWidth || !rawHeight) {
    throw new ValidationError(`Неверное соотношение сторон «${aspect}». Доступно: ${ASPECTS.join(", ")}`);
  }
  const ratio = rawWidth / rawHeight;
  const megapixels = Math.min(DEFAULT_MEGAPIXELS, maxMegapixels);
  const width = Math.sqrt(megapixels * 1_000_000 * ratio);
  const height = width / ratio;
  return { width: roundTo16(width), height: roundTo16(height) };
}

function normalizeSize({ width, height, aspect, maxMegapixels }) {
  if (width && height) {
    if (width < MIN_SIDE || height < MIN_SIDE) {
      throw new ValidationError(`Минимальный размер — ${MIN_SIDE}x${MIN_SIDE}`);
    }
    const megapixels = (width * height) / 1_000_000;
    if (megapixels > maxMegapixels + 0.05) {
      throw new ValidationError(
        `Размер ${width}x${height} (${megapixels.toFixed(1)} МП) больше лимита модели (${maxMegapixels} МП). Уменьши размер или выбери flux-1.1-ultra.`,
      );
    }
    return { width: roundTo16(width), height: roundTo16(height), aspect };
  }
  return { ...dimensionsFor(aspect, maxMegapixels), aspect };
}

async function toBuffer(image) {
  if (image.buffer) return image.buffer;
  if (image.base64) return Buffer.from(image.base64, "base64");
  if (image.url) return downloadBuffer(image.url);
  throw new ValidationError("Провайдер вернул изображение без данных");
}

/**
 * Главная функция генерации: выбирает провайдера, добирает нужное
 * количество картинок, сохраняет на диск и отдаёт результат.
 */
export async function generateImages({
  model: modelId,
  prompt,
  negativePrompt,
  aspect = "16:9",
  width,
  height,
  count = 1,
  seed,
  quality,
  filename,
  folder = "",
  save = true,
  preview = true,
}, deps = {}) {
  const model = getModel(modelId);
  if (!model) {
    throw new ValidationError(
      `Модель «${modelId}» не найдена.`,
      { hint: `Доступные id: ${MODEL_IDS.join(", ")}. Полный список с описанием — инструмент list_models.` },
    );
  }

  const cleanPrompt = String(prompt ?? "").trim();
  if (cleanPrompt.length < 3) {
    throw new ValidationError("Промпт слишком короткий — опиши, что должно быть на картинке (минимум 3 символа).");
  }

  const total = Math.max(1, Math.min(4, Math.round(count)));
  const negative = negativePrompt ? String(negativePrompt).trim() : "";
  const size = normalizeSize({ width, height, aspect, maxMegapixels: model.maxMegapixels });

  // Модели без negative prompt получают его как часть обычного промпта.
  const effectivePrompt = negative && !model.supports.negative
    ? `${cleanPrompt}\n\nAvoid: ${negative}.`
    : cleanPrompt;

  const provider = deps.provider ?? getProvider(model.provider);
  if (!provider) {
    throw new ValidationError(`Провайдер «${model.provider}» не подключён в mcp/imagegen/providers.`);
  }

  const collected = [];
  let extra = {};
  let guard = 0;

  while (collected.length < total && guard < 8) {
    guard += 1;
    const batch = Math.min(total - collected.length, model.maxCount ?? 1);
    const response = await provider.generate({
      model,
      prompt: effectivePrompt,
      negative,
      aspect: size.aspect,
      width: size.width,
      height: size.height,
      count: batch,
      seed,
      quality,
    });
    extra = { ...extra, ...(response.extra ?? {}) };
    if (!response.images?.length) break;
    collected.push(...response.images);
    if (response.images.length < batch) break;
  }

  if (!collected.length) {
    throw new ValidationError("Провайдер не вернул ни одного изображения. Попробуй другой промпт или модель.");
  }

  const buffers = [];
  for (const image of collected) {
    buffers.push(await toBuffer(image));
  }

  const meta = {
    model: model.id,
    provider: model.provider,
    prompt: cleanPrompt,
    negativePrompt: negative || null,
    aspect: size.aspect,
    seed: seed ?? extra.seed ?? null,
    quality: quality ?? null,
    priceUsd: Number((model.priceUsd * buffers.length).toFixed(3)),
    source: "generate_image",
    extra,
  };

  if (!save) {
    return {
      model,
      size,
      count: buffers.length,
      saved: null,
      meta,
      previewBuffer: buffers[0],
    };
  }

  const saved = await saveImages({
    buffers,
    baseName: filename || defaultBaseName(model.id, cleanPrompt),
    folder,
    meta,
    preview,
  });

  return {
    model,
    size,
    count: buffers.length,
    saved,
    meta,
    previewBuffer: buffers[0],
  };
}

/** Редактирование через GPT-image-1. */
export async function editImage({
  model: modelId = "gpt-image-1",
  prompt,
  imagePath,
  aspect = "1:1",
  quality,
  count = 1,
  filename,
  folder = "",
  save = true,
  preview = true,
}) {
  const model = getModel(modelId);
  if (!model) throw new ValidationError(`Модель «${modelId}» не найдена.`);
  if (!model.supports.edit) {
    throw new ValidationError(
      `${model.label} не поддерживает редактирование. Используй gpt-image-1.`,
      { hint: "Редактирование доступно только для gpt-image-1 (замена фона, добавление/удаление объектов, стилизация)." },
    );
  }
  if (!imagePath) throw new ValidationError("Укажи image_path — путь к локальному файлу или https-URL.");
  if (!prompt || String(prompt).trim().length < 3) throw new ValidationError("Опиши, что изменить на картинке.");

  const provider = getProvider(model.provider);
  const response = await provider.edit({
    model,
    prompt: String(prompt).trim(),
    imagePath,
    aspect,
    quality,
    count,
  });

  const buffers = [];
  for (const image of response.images) buffers.push(await toBuffer(image));

  const meta = {
    model: model.id,
    provider: model.provider,
    prompt: String(prompt).trim(),
    negativePrompt: null,
    aspect,
    seed: null,
    quality: quality ?? null,
    priceUsd: Number((model.priceUsd * buffers.length).toFixed(3)),
    source: `edit_image:${imagePath}`,
    extra: response.extra ?? {},
  };

  if (!save) {
    return { model, count: buffers.length, saved: null, meta, previewBuffer: buffers[0] };
  }

  const saved = await saveImages({
    buffers,
    baseName: filename || defaultBaseName(`${model.id}-edit`, prompt),
    folder,
    meta,
    preview,
  });

  return { model, count: buffers.length, saved, meta, previewBuffer: buffers[0] };
}
