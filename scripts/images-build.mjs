/**
 * Сборка изображений сайта.
 *
 *   npm run images:build          — брендовые ассеты + WebP из assets-src/services
 *   npm run images:apply          — ещё и прописать пути в БД (services.photo)
 *   node scripts/images-build.mjs --crop-bottom=9   — срезать нижние 9% (убрать watermark)
 *   node scripts/images-build.mjs --og=path/to.png  — взять готовую OG-картинку
 *
 * Исходники кладутся в:
 *   assets-src/services/{rent,sell,inspection,truck,import,service}.{png,jpg,jpeg,webp}
 *   assets-src/og.{png,jpg,jpeg,webp}            — опционально, иначе собирается из hero-poster
 *
 * Результат:
 *   public/images/services/{slug}.webp           1600×900
 *   public/images/placeholder-car.webp           1600×900 (заглушка «нет фото»)
 *   src/app/icon.png                             512×512
 *   src/app/apple-icon.png                       180×180
 *   src/app/favicon.ico                          32×32
 *   src/app/opengraph-image.jpg                  1200×630
 */
import { mkdir, readdir, stat, writeFile, unlink, copyFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "assets-src", "services");
const OUT_DIR = join(ROOT, "public", "images", "services");
const APP_DIR = join(ROOT, "src", "app");
const PUBLIC_IMG = join(ROOT, "public", "images");

const args = process.argv.slice(2);
const flag = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : def;
};
const has = (name) => args.includes(`--${name}`);

const CROP_BOTTOM = Number(flag("crop-bottom", "0"));
const APPLY = has("apply");
const SKIP_BRAND = has("skip-brand");
const OG_SOURCE = flag("og", "");

const SERVICE_SIZE = { width: 1600, height: 900 };
const OG_SIZE = { width: 1200, height: 630 };
const MAX_BYTES = 300 * 1024;

const ICON_SVG = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="glow" cx="0.78" cy="0.85" r="0.75">
      <stop offset="0" stop-color="#7f1d1d" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#0a0a0b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#18181b"/>
      <stop offset="1" stop-color="#050506"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="url(#bg)"/>
  <rect width="512" height="512" rx="${radius}" fill="url(#glow)"/>
  <text x="256" y="322" font-family="Arial Black, Arial, Helvetica, sans-serif" font-size="196" font-weight="900" text-anchor="middle" letter-spacing="-14"><tspan fill="#fafafa">A</tspan><tspan fill="#ef4444">W</tspan></text>
</svg>`;

const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#18181b"/>
      <stop offset="0.55" stop-color="#0d0d0f"/>
      <stop offset="1" stop-color="#050506"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.62" r="0.55">
      <stop offset="0" stop-color="#ef4444" stop-opacity="0.13"/>
      <stop offset="1" stop-color="#ef4444" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M80 0 L0 0 0 80" fill="none" stroke="#ffffff" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1600" height="900" fill="url(#bg)"/>
  <rect width="1600" height="900" fill="url(#grid)"/>
  <rect width="1600" height="900" fill="url(#glow)"/>
  <g transform="translate(560 300) scale(20)" fill="none" stroke="#71717a" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round" opacity="0.75">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
  </g>
  <text x="800" y="760" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#52525b" text-anchor="middle" letter-spacing="6">ФОТО СКОРО ПОЯВИТСЯ</text>
  <text x="800" y="830" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#3f3f46" text-anchor="middle">АВТО<tspan fill="#7f1d1d">WAY</tspan></text>
</svg>`;

const OG_OVERLAY = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#09090b" stop-opacity="0.97"/>
      <stop offset="0.45" stop-color="#09090b" stop-opacity="0.82"/>
      <stop offset="0.75" stop-color="#09090b" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#09090b" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="b" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#09090b" stop-opacity="0"/>
      <stop offset="1" stop-color="#09090b" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#l)"/>
  <rect width="1200" height="630" fill="url(#b)"/>
  <rect x="80" y="392" width="72" height="5" rx="2.5" fill="#ef4444"/>
  <text x="80" y="320" font-family="Arial, Helvetica, sans-serif" font-size="104" font-weight="bold" fill="#fafafa" letter-spacing="-2">АВТО<tspan fill="#ef4444">WAY</tspan></text>
  <text x="82" y="372" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#a1a1aa" letter-spacing="4">НАМ МОЖНО ВЕРИТЬ</text>
  <text x="80" y="462" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#d4d4d8">Аренда авто · Автоподбор · Продажа</text>
  <text x="80" y="510" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#71717a">avtoway.by · Минск, Беларусь</text>
</svg>`;

const kb = (n) => `${Math.round(n / 1024)} КБ`;

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/** PNG-байты → .ico-контейнер (ICO умеет хранить PNG для размеров >= 32). */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // images count
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bpp
  entry.writeUInt32LE(png.length, 8); // data size
  entry.writeUInt32LE(22, 12); // data offset
  return Buffer.concat([header, entry, png]);
}

async function buildBrand() {
  await mkdir(APP_DIR, { recursive: true });
  await mkdir(PUBLIC_IMG, { recursive: true });

  await sharp(Buffer.from(ICON_SVG(512, 96))).png({ compressionLevel: 9 }).toFile(join(APP_DIR, "icon.png"));
  await sharp(Buffer.from(ICON_SVG(180, 0))).png({ compressionLevel: 9 }).toFile(join(APP_DIR, "apple-icon.png"));

  const favPng = await sharp(Buffer.from(ICON_SVG(32, 0))).png().toBuffer();
  await unlink(join(APP_DIR, "favicon.ico")).catch(() => {});
  await writeFile(join(APP_DIR, "favicon.ico"), pngToIco(favPng, 32));

  await sharp(Buffer.from(PLACEHOLDER_SVG)).webp({ quality: 86, effort: 5 }).toFile(join(PUBLIC_IMG, "placeholder-car.webp"));

  console.log("✓ брендовые ассеты: icon.png, apple-icon.png, favicon.ico, placeholder-car.webp");
}

async function buildOg() {
  const src =
    OG_SOURCE ||
    (await firstExisting([
      join(ROOT, "assets-src", "og.png"),
      join(ROOT, "assets-src", "og.jpg"),
      join(ROOT, "assets-src", "og.jpeg"),
      join(ROOT, "assets-src", "og.webp"),
    ]));

  const out = join(APP_DIR, "opengraph-image.jpg");

  if (src) {
    await sharp(src)
      .resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover", position: "centre", kernel: "lanczos3" })
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(out);
    console.log(`✓ OG из ${src.replace(ROOT + "\\", "")}`);
  } else {
    const heroPoster = join(ROOT, "public", "videos", "hero-poster.jpg");
    if (!(await exists(heroPoster))) {
      console.log("• OG пропущен: нет assets-src/og.* и нет hero-poster.jpg");
      return;
    }
    const base = await sharp(heroPoster)
      .resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover", position: "centre" })
      .modulate({ brightness: 0.75, saturation: 0.85 })
      .toBuffer();
    await sharp(base)
      .composite([{ input: Buffer.from(OG_OVERLAY) }])
      .jpeg({ quality: 88, progressive: true, mozjpeg: true })
      .toFile(out);
    console.log("✓ OG собран из public/videos/hero-poster.jpg (замените через assets-src/og.*)");
  }
  const size = (await stat(out)).size;
  await copyFile(out, join(APP_DIR, "twitter-image.jpg"));
  console.log(`  ${kb(size)} → src/app/opengraph-image.jpg + twitter-image.jpg`);
}

async function firstExisting(paths) {
  for (const p of paths) if (await exists(p)) return p;
  return "";
}

async function buildServices() {
  await mkdir(OUT_DIR, { recursive: true });
  if (!(await exists(SRC_DIR))) {
    console.log("• assets-src/services/ не найдена — обложки услуг не собирались");
    return [];
  }

  const files = (await readdir(SRC_DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  if (files.length === 0) {
    console.log("• в assets-src/services/ нет картинок");
    return [];
  }

  const built = [];
  for (const file of files) {
    const slug = basename(file, extname(file));
    const input = join(SRC_DIR, file);
    const output = join(OUT_DIR, `${slug}.webp`);

    let img = sharp(input).rotate();
    const meta = await img.metadata();
    if (CROP_BOTTOM > 0 && meta.height) {
      const cut = Math.round((meta.height * CROP_BOTTOM) / 100);
      img = img.extract({ left: 0, top: 0, width: meta.width, height: Math.max(1, meta.height - cut) });
    }

    await img
      .resize(SERVICE_SIZE.width, SERVICE_SIZE.height, {
        fit: "cover",
        position: "centre",
        kernel: "lanczos3",
      })
      .sharpen({ sigma: 0.6 })
      .webp({ quality: 82, effort: 5 })
      .toFile(output);

    const size = (await stat(output)).size;
    built.push({ slug, size });
    const warn = size > MAX_BYTES ? "  ⚠ больше 300 КБ — уменьшите quality" : "";
    console.log(`✓ ${file} → public/images/services/${slug}.webp  ${kb(size)}${warn}`);
  }
  return built;
}

async function applyToDb(built) {
  if (built.length === 0) return;
  let createClient;
  try {
    ({ createClient } = await import("@libsql/client"));
  } catch {
    console.log("! @libsql/client не найден — пропускаю запись в БД");
    return;
  }

  const url = process.env.DATABASE_URL || "file:./data/avtoway.db";
  const db = createClient({ url });
  let changed = 0;
  for (const { slug } of built) {
    const photo = `/images/services/${slug}.webp`;
    const res = await db.execute({
      sql: "UPDATE services SET photo = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
      args: [photo, slug],
    });
    if (res.rowsAffected > 0) {
      changed += res.rowsAffected;
      console.log(`  БД: ${slug}.photo = ${photo}`);
    } else {
      console.log(`  БД: услуга «${slug}» не найдена — пропуск`);
    }
  }
  db.close();
  console.log(`✓ обновлено записей: ${changed}`);
}

console.log("Сборка изображений АВТОWAY\n");
if (!SKIP_BRAND) await buildBrand();
await buildOg();
const built = await buildServices();
if (APPLY) await applyToDb(built);
console.log("\nГотово.");
