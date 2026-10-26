/**
 * Проверка полного конвейера generate_image без обращения к API:
 * подменяем провайдера на фейковый, пишем во временную папку.
 */
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const dir = await mkdtemp(join(tmpdir(), "imagegen-pipeline-"));
process.env.IMAGEGEN_OUTPUT_DIR = dir;

const { generateImages } = await import("../lib/generate.mjs");

const fakeProvider = {
  name: "fake",
  async generate({ count, width, height }) {
    const images = [];
    for (let index = 0; index < count; index += 1) {
      const buffer = await sharp({
        create: { width, height, channels: 3, background: { r: 40 + index * 60, g: 90, b: 170 } },
      })
        .png()
        .toBuffer();
      images.push({ buffer, mimeType: "image/png" });
    }
    return { images, extra: { seed: 42 } };
  },
};

try {
  const result = await generateImages(
    {
      model: "flux-1.1-pro",
      prompt: "test pipeline, black car, evening light",
      aspect: "16:9",
      count: 2,
      filename: "pipeline-test",
      folder: "checks",
    },
    { provider: fakeProvider },
  );

  if (result.count !== 2) throw new Error(`count=${result.count}, ожидалось 2`);
  if (result.saved.files.length !== 2) throw new Error("сохранено не 2 файла");

  const files = await readdir(join(dir, "checks"));
  const main = files.filter((file) => file.endsWith(".webp") && !file.includes("@"));
  if (main.length !== 2) throw new Error(`webp: ${main.length}`);

  const meta = JSON.parse(await readFile(join(dir, "checks", "pipeline-test.json"), "utf8"));
  if (meta.model !== "flux-1.1-pro") throw new Error("в метаданных неверная модель");
  if (meta.priceUsd <= 0) throw new Error("не посчитана стоимость");
  if (!meta.files[0].variants.length) throw new Error("нет адаптивных размеров");
  if (!result.saved.preview?.data) throw new Error("нет превью");

  const stat = await sharp(Buffer.from(await readFile(result.saved.files[0].path))).metadata();
  if (stat.format !== "webp") throw new Error("формат не webp");

  console.log("OK pipeline: провайдер → 2 webp + адаптив + json + превью");
  console.log(`   папка: checks/, модель: ${meta.model}, цена: $${meta.priceUsd}`);
} finally {
  await sharp.cache(false);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(dir, { recursive: true, force: true });
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
}
