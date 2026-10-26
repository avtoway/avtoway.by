import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import sharp from "sharp";
import { OUTPUT_ROOT, PROJECT_ROOT, PUBLIC_DIR } from "./env.mjs";
import { ValidationError } from "./errors.mjs";

const MAIN_MAX_WIDTH = 2048;
const RESPONSIVE_WIDTHS = [1024, 640];

export function toPosix(path) {
  return path.split(sep).join("/");
}

/** Абсолютный путь → URL для Next.js (/images/generated/...), если внутри public. */
export function publicUrl(absolutePath) {
  const insidePublic = resolve(absolutePath).startsWith(resolve(PUBLIC_DIR) + sep);
  if (!insidePublic) return toPosix(absolutePath);
  return "/" + toPosix(relative(PUBLIC_DIR, absolutePath));
}

export function sanitizeSegment(value, fallback) {
  const cleaned = String(value ?? "")
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "")
    .toLowerCase();
  return cleaned || fallback;
}

function assertInside(root, target) {
  const rootResolved = resolve(root);
  const targetResolved = resolve(target);
  if (targetResolved !== rootResolved && !targetResolved.startsWith(rootResolved + sep)) {
    throw new ValidationError(`Путь вне разрешённой папки: ${target}`);
  }
}

async function uniqueBaseName(dir, baseName) {
  let candidate = baseName;
  let counter = 2;
  while (
    existsSync(resolve(dir, `${candidate}.webp`)) ||
    existsSync(resolve(dir, `${candidate}.json`))
  ) {
    candidate = `${baseName}-${counter}`;
    counter += 1;
  }
  return candidate;
}

export function defaultBaseName(modelId, prompt) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const words = sanitizeSegment(
    String(prompt || "")
      .split(/\s+/)
      .slice(0, 4)
      .join("-"),
    "image",
  ).slice(0, 40);
  return `${sanitizeSegment(modelId, "img")}-${stamp}-${words}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Сохраняет картинки в webp + адаптивные размеры + json-метаданные.
 * Возвращает список файлов, превью (jpeg base64) и путь к метаданным.
 */
export async function saveImages({
  buffers,
  baseName,
  folder = "",
  meta = {},
  outputRoot = OUTPUT_ROOT,
  preview = true,
}) {
  if (!Array.isArray(buffers) || buffers.length === 0) {
    throw new ValidationError("Нет изображений для сохранения");
  }

  const safeFolder = folder
    ? folder
        .split(/[\\/]+/)
        .filter(Boolean)
        .map((part) => sanitizeSegment(part, ""))
        .filter(Boolean)
        .join(sep)
    : "";
  const dir = resolve(outputRoot, safeFolder);
  assertInside(outputRoot, dir);
  await mkdir(dir, { recursive: true });

  const base = await uniqueBaseName(dir, sanitizeSegment(baseName, defaultBaseName("img", "")));
  const files = [];

  for (let index = 0; index < buffers.length; index += 1) {
    const suffix = buffers.length > 1 ? `-${index + 1}` : "";
    const name = `${base}${suffix}`;
    const pipeline = sharp(buffers[index], { failOn: "none" }).rotate();
    const metadata = await pipeline.metadata();
    const originalWidth = metadata.width ?? MAIN_MAX_WIDTH;
    const originalHeight = metadata.height ?? MAIN_MAX_WIDTH;
    const width = Math.min(originalWidth, MAIN_MAX_WIDTH);
    const height = Math.round((originalHeight / originalWidth) * width);

    const mainPath = resolve(dir, `${name}.webp`);
    const mainBuffer = await pipeline
      .clone()
      .resize({ width, height, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, effort: 4 })
      .toBuffer();
    await writeFile(mainPath, mainBuffer);

    const variants = [];
    for (const variantWidth of RESPONSIVE_WIDTHS) {
      if (variantWidth >= width) continue;
      const variantPath = resolve(dir, `${name}@${variantWidth}.webp`);
      const variantBuffer = await pipeline
        .clone()
        .resize({ width: variantWidth, withoutEnlargement: true })
        .webp({ quality: 84, effort: 4 })
        .toBuffer();
      await writeFile(variantPath, variantBuffer);
      variants.push({
        width: variantWidth,
        path: variantPath,
        url: publicUrl(variantPath),
        bytes: variantBuffer.length,
      });
    }

    files.push({
      path: mainPath,
      url: publicUrl(mainPath),
      width,
      height,
      originalWidth,
      originalHeight,
      bytes: mainBuffer.length,
      variants,
      format: "webp",
    });
  }

  const metaPath = resolve(dir, `${base}.json`);
  const metaPayload = {
    createdAt: new Date().toISOString(),
    model: meta.model ?? null,
    provider: meta.provider ?? null,
    prompt: meta.prompt ?? null,
    negativePrompt: meta.negativePrompt ?? null,
    aspect: meta.aspect ?? null,
    seed: meta.seed ?? null,
    quality: meta.quality ?? null,
    priceUsd: meta.priceUsd ?? null,
    source: meta.source ?? null,
    files: files.map((file) => ({
      url: file.url,
      path: toPosix(relative(PROJECT_ROOT, file.path)),
      width: file.width,
      height: file.height,
      bytes: file.bytes,
      variants: file.variants.map((variant) => variant.url),
    })),
    extra: meta.extra ?? null,
  };
  await writeFile(metaPath, `${JSON.stringify(metaPayload, null, 2)}\n`, "utf8");

  let previewBlock = null;
  if (preview) {
    const previewBuffer = await sharp(buffers[0], { failOn: "none" })
      .rotate()
      .resize({ width: 512, withoutEnlargement: true })
      .jpeg({ quality: 74, mozjpeg: true })
      .toBuffer();
    previewBlock = { data: previewBuffer.toString("base64"), mimeType: "image/jpeg" };
  }

  return {
    baseName: base,
    dir,
    folder: safeFolder,
    files,
    metaPath,
    metaUrl: publicUrl(metaPath),
    meta: metaPayload,
    preview: previewBlock,
  };
}

async function walk(dir, depth, collector) {
  if (depth < 0) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, depth - 1, collector);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".webp")) {
      if (/@\d+\.webp$/i.test(entry.name)) continue;
      collector.push(full);
    }
  }
}

export async function listGenerated({ folder = "", limit = 20, outputRoot = OUTPUT_ROOT } = {}) {
  const root = resolve(outputRoot);
  const dir = folder ? resolve(root, folder) : root;
  assertInside(root, dir);

  const found = [];
  await walk(dir, 2, found);

  const items = [];
  for (const file of found) {
    const info = await stat(file);
    const metaFile = file.replace(/\.webp$/i, ".json");
    let meta = null;
    if (existsSync(metaFile)) {
      try {
        meta = JSON.parse(await readFile(metaFile, "utf8"));
      } catch {
        meta = null;
      }
    }
    items.push({
      url: publicUrl(file),
      path: toPosix(relative(PROJECT_ROOT, file)),
      width: meta?.files?.[0]?.width ?? null,
      height: meta?.files?.[0]?.height ?? null,
      bytes: info.size,
      createdAt: meta?.createdAt ?? info.mtime.toISOString(),
      model: meta?.model ?? null,
      prompt: meta?.prompt ?? null,
      variants: meta?.files?.[0]?.variants ?? [],
    });
  }

  items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return items.slice(0, Math.max(1, limit));
}

export async function ensureOutputDir(outputRoot = OUTPUT_ROOT) {
  await mkdir(outputRoot, { recursive: true });
  return outputRoot;
}

export async function outputDirInfo(outputRoot = OUTPUT_ROOT) {
  try {
    await ensureOutputDir(outputRoot);
    const probe = resolve(outputRoot, ".write-test");
    await writeFile(probe, "ok");
    await stat(probe);
    await rm(probe, { force: true });
    return { ok: true, dir: outputRoot };
  } catch (error) {
    return { ok: false, dir: outputRoot, error: error.message };
  }
}

export { MAIN_MAX_WIDTH, RESPONSIVE_WIDTHS };
