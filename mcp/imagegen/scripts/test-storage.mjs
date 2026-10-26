import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { listGenerated, saveImages } from "../lib/storage.mjs";

const dir = await mkdtemp(join(tmpdir(), "imagegen-storage-"));

try {
  // Синтетическая картинка 1600x900 (имитация результата провайдера).
  const svg = `<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1f3a"/><stop offset="50%" stop-color="#1f6feb"/>
      <stop offset="100%" stop-color="#f5a623"/>
    </linearGradient></defs>
    <rect width="1600" height="900" fill="url(#g)"/>
    <circle cx="1200" cy="300" r="220" fill="#ffffff" opacity="0.35"/>
  </svg>`;
  const source = await sharp(Buffer.from(svg)).png().toBuffer();

  const saved = await saveImages({
    buffers: [source],
    baseName: "test-hero",
    outputRoot: dir,
    meta: { model: "test", provider: "local", prompt: "storage smoke test", aspect: "16:9" },
  });

  const files = await readdir(dir);
  const expected = ["test-hero.webp", "test-hero@1024.webp", "test-hero@640.webp", "test-hero.json"];
  const missing = expected.filter((name) => !files.includes(name));
  if (missing.length) throw new Error(`не созданы файлы: ${missing.join(", ")}`);

  const meta = JSON.parse(await readFile(join(dir, "test-hero.json"), "utf8"));
  if (meta.prompt !== "storage smoke test") throw new Error("метаданные записались неверно");

  const listed = await listGenerated({ outputRoot: dir, limit: 10 });
  if (listed.length !== 1) throw new Error(`listGenerated вернул ${listed.length}, ожидалось 1`);

  const info = await sharp(await readFile(join(dir, "test-hero.webp"))).metadata();
  if (info.format !== "webp" || info.width !== 1600) {
    throw new Error(`неверный формат/размер: ${info.format} ${info.width}x${info.height}`);
  }

  const previewBytes = Buffer.from(saved.preview.data, "base64").length;
  if (previewBytes < 1000) throw new Error("превью пустое");

  console.log("OK storage: webp + @1024 + @640 + json + превью");
  console.log(`   файлов: ${files.length}, превью: ${(previewBytes / 1024).toFixed(0)} КБ`);
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
