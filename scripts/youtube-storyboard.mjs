#!/usr/bin/env node
/**
 * Разбор YouTube-ролика через Gemini API (видео передаётся ссылкой, без скачивания).
 *
 * Использование:
 *   node scripts/youtube-storyboard.mjs https://www.youtube.com/watch?v=XXXX
 *   node scripts/youtube-storyboard.mjs XXXX --idea "превью для ролика про растаможку"
 *   node scripts/youtube-storyboard.mjs --list      # какие модели доступны ключу
 *
 * Ключ берётся из GOOGLE_API_KEY / GEMINI_API_KEY (в .env, .env.local или mcp/imagegen/.env).
 * Результат: docs/youtube/<videoId>.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = "https://generativelanguage.googleapis.com/v1beta";

// Порядок проб: первый, который ответит и примет видео, используется.
const MODEL_CANDIDATES = [
  process.env.GEMINI_VIDEO_MODEL,
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
].filter(Boolean);

// ---------- env ----------

function loadEnv() {
  for (const file of [".env.local", ".env", "mcp/imagegen/.env"]) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    for (const raw of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

// ---------- cli ----------

function parseArgs(argv) {
  const out = { url: null, idea: null, model: null, out: null, list: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--list") out.list = true;
    else if (arg === "--model") out.model = argv[++i];
    else if (arg === "--out") out.out = argv[++i];
    else if (arg === "--idea") out.idea = argv[++i];
    else if (arg === "--help" || arg === "-h") out.help = true;
    else if (!out.url) out.url = arg;
  }
  return out;
}

function usage() {
  console.log(`Разбор YouTube-видео через Gemini.

  node scripts/youtube-storyboard.mjs <url|videoId> [опции]

  --idea "<текст>"   на чём сфокусировать идеи превью (по умолчанию — суть ролика)
  --model <name>     конкретная модель Gemini
  --out <path>       куда сохранить разбор (по умолчанию docs/youtube/<videoId>.md)
  --list             показать модели, доступные ключу
`);
}

// ---------- youtube ----------

function videoId(input) {
  if (!input) return null;
  if (/^[\w-]{11}$/.test(input)) return input;
  let url;
  try {
    url = new URL(input);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return url.pathname.slice(1, 12) || null;
  const v = url.searchParams.get("v");
  if (v) return v.slice(0, 11);
  const m = url.pathname.match(/\/(?:shorts|embed|live|v)\/([\w-]{11})/);
  return m ? m[1] : null;
}

// ---------- gemini ----------

async function api(pathname, key, init = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 800) };
  }
  return { res, body };
}

async function listModels(key) {
  const { res, body } = await api("/models?pageSize=1000", key);
  if (!res.ok) throw new Error(`models list: ${res.status} ${JSON.stringify(body).slice(0, 400)}`);
  return (body.models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
    .map((m) => m.name.replace(/^models\//, ""));
}

function buildPrompt(idea) {
  const focus = idea || "суть и главная мысль ролика";
  return `Ты — режиссёр и продюсер YouTube-канала. Посмотри это видео целиком и разбери его для создания превью (thumbnail).

Фокус: ${focus}.

Ответ строго в такой структуре (Markdown, по-русски):

## 1. Кратко о ролике
Что происходит, главная мысль, целевая аудитория, тон (2–4 предложения).

## 2. Раскадровка
Таблица по таймкодам (mm:ss), 8–15 ключевых моментов. Колонки:
| Таймкод | Что в кадре | План/ракурс | Эмоция спикера | Текст на экране | Свет и цвета |

## 3. Что цепляет
3–5 приёмов, которые реально удерживают внимание (по кадру, не по монтажу).

## 4. Три идеи превью
Для каждой: концепция в одном предложении · герой и эмоция · композиция · фон · что крупно · чем провоцируем клик. Без обмана: не обещать того, чего в ролике нет.

## 5. Готовый промт для генератора изображений
Для лучшей из трёх идей — один плотный промт на английском, 16:9, 1280x720, фотореализм, без текста и логотипов в кадре (текст потом верстается поверх). Формат:

**Prompt:** ...
**Negative:** ...

## 6. Цвета и место под заголовок
Палитра (3–4 цвета с HEX) и где оставить свободную зону под текст.`;
}

async function generate(model, key, url, prompt) {
  return api(`/models/${model}:generateContent`, key, {
    method: "POST",
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ fileData: { fileUri: url } }, { text: prompt }],
        },
      ],
      generationConfig: { temperature: 0.6, maxOutputTokens: 8192 },
    }),
  });
}

function extractText(body) {
  const cand = body?.candidates?.[0];
  if (!cand) return "";
  return (cand.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
}

function explainError(body) {
  const e = body?.error;
  if (!e) return JSON.stringify(body).slice(0, 500);
  return `${e.code || ""} ${e.status || ""}: ${e.message || ""}`.trim();
}

// ---------- main ----------

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  if (args.help || (!args.url && !args.list)) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    console.error(
      "Нет ключа Google. Добавь в .env строку:\n  GOOGLE_API_KEY=...\nКлюч: https://aistudio.google.com/apikey"
    );
    process.exit(1);
  }

  if (args.list) {
    console.log((await listModels(key)).join("\n"));
    return;
  }

  const id = videoId(args.url);
  if (!id) {
    console.error(`Не понял ссылку: ${args.url}`);
    process.exit(1);
  }
  const url = `https://www.youtube.com/watch?v=${id}`;

  const prompt = buildPrompt(args.idea);
  const models = args.model ? [args.model] : MODEL_CANDIDATES;

  console.log(`Видео: ${url}`);
  let text = "";
  let usedModel = "";

  for (const model of models) {
    process.stdout.write(`Модель ${model}… `);
    const { res, body } = await generate(model, key, url, prompt);
    if (!res.ok) {
      console.log(`нет (${explainError(body)})`);
      continue;
    }
    const out = extractText(body);
    const blockReason = body?.promptFeedback?.blockReason;
    if (!out) {
      console.log(`пустой ответ${blockReason ? ` (blockReason: ${blockReason})` : ""}`);
      continue;
    }
    text = out;
    usedModel = model;
    console.log("ок");
    break;
  }

  if (!text) {
    console.error(
      "\nНи одна модель не отдала разбор. Частые причины: ключ без доступа к видео-моделям, ролик приватный/удалён, регион или лимит запросов."
    );
    process.exit(1);
  }

  const header = `# Разбор видео ${id}\n\n- Ссылка: ${url}\n- Модель: ${usedModel}\n- Дата: ${new Date()
    .toISOString()
    .slice(0, 10)}\n${args.idea ? `- Фокус: ${args.idea}\n` : ""}\n---\n\n`;
  const outPath = args.out
    ? path.resolve(ROOT, args.out)
    : path.join(ROOT, "docs", "youtube", `${id}.md`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, header + text + "\n", "utf8");

  console.log(`\n${text}\n`);
  console.log(`Сохранено: ${outPath}`);
}

main().catch((err) => {
  console.error(`Ошибка: ${err.message}`);
  process.exit(1);
});
