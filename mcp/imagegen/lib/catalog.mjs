import { maskSecret } from "./env.mjs";

/**
 * Каталог моделей. id — то, что передаётся в generate_image(model=...).
 *
 * Поля:
 *  - priceUsd   примерная цена за одно изображение в USD
 *  - quality    1..5 (насколько «профессионально» выглядит результат)
 *  - speed      1..5 (5 = быстро)
 *  - sizeMode   как модель принимает размер: pixels | aspect | preset | openai
 *  - maxCount   сколько картинок отдаёт за один запрос (остальное добирается повторами)
 *  - supports   negative prompt / seed / редактирование / качество текста на картинке
 */
export const MODELS = [
  {
    id: "pollinations-flux",
    label: "Pollinations FLUX (бесплатно)",
    provider: "pollinations",
    apiModel: "flux",
    keyEnv: null,
    keyUrl: "https://pollinations.ai",
    priceUsd: 0,
    quality: 4,
    speed: 3,
    sizeMode: "pixels",
    maxCount: 4,
    maxMegapixels: 4,
    supports: { negative: false, seed: true, edit: false, text: "плохо" },
    bestFor: ["черновики", "фоны", "атмосферные фото", "hero", "иллюстрации"],
    avoid: "текст, логотипы, точные лица",
    note: "Бесплатный FLUX через Pollinations: без API-ключа, для черновиков и атмосферных фонов. Качество ниже flux-1.1-pro, но для лендинга достаточно.",
  },
  {
    id: "flux-1.1-pro",
    label: "FLUX 1.1 Pro",
    provider: "fal",
    apiModel: "fal-ai/flux-pro/v1.1",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.04,
    quality: 5,
    speed: 3,
    sizeMode: "pixels",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["фотореализм", "автомобили", "интерьеры", "люди", "обложки", "баннеры", "сайт", "аренда"],
    avoid: "мелкий текст, логотипы, точные надписи",
    note: "Основная рабочая модель. Фотореалистичные кадры для сайта: авто, услуги, интерьеры. Хорошая детализация, 4 варианта за запрос.",
  },
  {
    id: "flux-1.1-ultra",
    label: "FLUX 1.1 Ultra",
    provider: "fal",
    apiModel: "fal-ai/flux-pro/v1.1-ultra",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.06,
    quality: 5,
    speed: 2,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 4,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["фотореализм", "реклама", "печать", "большое разрешение", "премиум", "обложки"],
    avoid: "быстрые черновики, текст",
    note: "Максимальное качество и разрешение до 4 МП. Для главного баннера, печати, премиальных блоков. Дороже и медленнее Pro.",
  },
  {
    id: "flux-schnell",
    label: "FLUX Schnell",
    provider: "fal",
    apiModel: "fal-ai/flux/schnell",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.003,
    quality: 3,
    speed: 5,
    sizeMode: "pixels",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "слабо" },
    bestFor: ["черновик", "быстро", "много вариантов", "идеи", "превью", "тест"],
    avoid: "финальные картинки на сайт, мелкие детали",
    note: "Самая дешёвая и быстрая. Идеально перебрать 10 идей композиции, а финал сделать на flux-1.1-pro.",
  },
  {
    id: "flux-dev",
    label: "FLUX.1 dev",
    provider: "fal",
    apiModel: "fal-ai/flux/dev",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.025,
    quality: 4,
    speed: 3,
    sizeMode: "pixels",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["фотореализм", "дешевле pro", "много вариантов", "иллюстрации", "сайт"],
    avoid: "текст, максимальная детализация",
    note: "Компромисс: заметно дешевле Pro при близком качестве. Хорош, когда нужно 8–12 вариантов одной сцены.",
  },
  {
    id: "flux-pro-bfl",
    label: "FLUX 1.1 Pro (BFL напрямую)",
    provider: "bfl",
    apiModel: "flux-pro-1.1",
    keyEnv: "BFL_API_KEY",
    keyUrl: "https://dashboard.bfl.ai/",
    priceUsd: 0.04,
    quality: 5,
    speed: 3,
    sizeMode: "pixels",
    maxCount: 1,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["фотореализм", "резерв", "автомобили", "интерьеры"],
    avoid: "пакетная генерация (1 шт. за запрос)",
    note: "Тот же FLUX Pro, но через API Black Forest Labs. Нужен, если fal.ai недоступен или уже есть ключ BFL. Медленнее: задача создаётся и опрашивается.",
  },
  {
    id: "flux-ultra-bfl",
    label: "FLUX 1.1 Ultra (BFL напрямую)",
    provider: "bfl",
    apiModel: "flux-pro-1.1-ultra",
    keyEnv: "BFL_API_KEY",
    keyUrl: "https://dashboard.bfl.ai/",
    priceUsd: 0.06,
    quality: 5,
    speed: 2,
    sizeMode: "aspect",
    maxCount: 1,
    maxMegapixels: 4,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["реклама", "печать", "большое разрешение", "премиум"],
    avoid: "черновики, пакетная генерация",
    note: "Ultra через BFL: максимальное разрешение и качество, по одному изображению за запрос.",
  },
  {
    id: "imagen-4",
    label: "Imagen 4",
    provider: "google",
    apiModel: "imagen-4.0-generate-001",
    keyEnv: "GOOGLE_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey",
    priceUsd: 0.04,
    quality: 5,
    speed: 4,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: false, edit: false, text: "хорошо" },
    bestFor: ["фотореализм", "коммерция", "люди", "еда", "чистые кадры", "сайт"],
    avoid: "очень узкие кадры 21:9",
    note: "Очень чистые «коммерческие» кадры, аккуратная композиция. Хорошая альтернатива FLUX, если уже есть ключ Google (есть бесплатный лимит в AI Studio).",
  },
  {
    id: "imagen-4-ultra",
    label: "Imagen 4 Ultra",
    provider: "google",
    apiModel: "imagen-4.0-ultra-generate-001",
    keyEnv: "GOOGLE_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey",
    priceUsd: 0.06,
    quality: 5,
    speed: 3,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: false, edit: false, text: "хорошо" },
    bestFor: ["реклама", "премиум", "люди", "детализация", "печать"],
    avoid: "черновики, массовые прогоны",
    note: "Максимум детализации у Imagen. Для ключевых баннеров и портретов.",
  },
  {
    id: "imagen-4-fast",
    label: "Imagen 4 Fast",
    provider: "google",
    apiModel: "imagen-4.0-fast-generate-001",
    keyEnv: "GOOGLE_API_KEY",
    keyUrl: "https://aistudio.google.com/apikey",
    priceUsd: 0.02,
    quality: 4,
    speed: 5,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: false, edit: false, text: "средне" },
    bestFor: ["быстро", "дёшево", "черновик", "много вариантов", "сайт"],
    avoid: "максимальная детализация",
    note: "Быстрая и недорогая Imagen. Хороша для перебора вариантов и второстепенных картинок.",
  },
  {
    id: "gpt-image-1",
    label: "GPT-image-1",
    provider: "openai",
    apiModel: "gpt-image-1",
    keyEnv: "OPENAI_API_KEY",
    keyUrl: "https://platform.openai.com/api-keys",
    priceUsd: 0.08,
    quality: 4,
    speed: 3,
    sizeMode: "openai",
    maxCount: 4,
    maxMegapixels: 1.6,
    supports: { negative: false, seed: false, edit: true, text: "отлично" },
    bestFor: ["текст на картинке", "инфографика", "постер", "логотип", "сложная инструкция", "редактирование"],
    avoid: "максимальный фотореализм, массовые прогоны",
    note: "Лучше всех понимает сложный промпт и рисует надписи. Единственная модель в каталоге с редактированием (edit_image): заменить фон, добавить/убрать объект.",
  },
  {
    id: "ideogram-3",
    label: "Ideogram 3.0",
    provider: "ideogram",
    apiModel: "ideogram-v3",
    keyEnv: "IDEOGRAM_API_KEY",
    keyUrl: "https://ideogram.ai/manage-api",
    priceUsd: 0.05,
    quality: 4,
    speed: 3,
    sizeMode: "aspect",
    maxCount: 1,
    maxMegapixels: 2,
    supports: { negative: true, seed: true, edit: false, text: "отлично" },
    bestFor: ["текст на картинке", "логотип", "вывеска", "постер", "типографика", "бренд"],
    avoid: "фотореализм авто, быстрые черновики",
    note: "Лучший выбор для надписей, логотипов, вывесок и типографики. Поддерживает negative prompt.",
  },
  {
    id: "seedream-3",
    label: "Seedream 3.0",
    provider: "fal",
    apiModel: "fal-ai/bytedance/seedream/v3/text-to-image",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.03,
    quality: 4,
    speed: 4,
    sizeMode: "pixels",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "хорошо" },
    bestFor: ["фотореализм", "азиатская эстетика", "портреты", "дешевле pro", "сайт"],
    avoid: "сложные надписи",
    note: "Быстрая и дешёвая альтернатива FLUX с приятной «плёночной» картинкой. Хороша для людей и портретов.",
  },
  {
    id: "recraft-v3",
    label: "Recraft V3",
    provider: "fal",
    apiModel: "fal-ai/recraft-v3",
    keyEnv: "FAL_KEY",
    keyUrl: "https://fal.ai/dashboard/keys",
    priceUsd: 0.04,
    quality: 4,
    speed: 3,
    sizeMode: "preset",
    maxCount: 1,
    maxMegapixels: 2,
    supports: { negative: false, seed: false, edit: false, text: "хорошо" },
    bestFor: ["дизайн", "иконки", "вектор", "иллюстрация", "баннер", "стиль бренда"],
    avoid: "фотореализм людей, быстрые черновики",
    note: "Дизайнерская модель: иллюстрации, иконки, вектор, плоские стили. Один вариант за запрос.",
  },
  {
    id: "replicate-flux-schnell",
    label: "FLUX Schnell (Replicate)",
    provider: "replicate",
    apiModel: "black-forest-labs/flux-schnell",
    keyEnv: "REPLICATE_API_TOKEN",
    keyUrl: "https://replicate.com/account/api-tokens",
    priceUsd: 0.003,
    quality: 3,
    speed: 4,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "слабо" },
    bestFor: ["черновик", "резерв", "быстро", "идеи"],
    avoid: "финальные картинки",
    note: "FLUX Schnell через Replicate. Нужен, если работаешь через Replicate и не хочешь заводить fal.ai.",
  },
  {
    id: "replicate-flux-dev",
    label: "FLUX.1 dev (Replicate)",
    provider: "replicate",
    apiModel: "black-forest-labs/flux-dev",
    keyEnv: "REPLICATE_API_TOKEN",
    keyUrl: "https://replicate.com/account/api-tokens",
    priceUsd: 0.025,
    quality: 4,
    speed: 3,
    sizeMode: "aspect",
    maxCount: 4,
    maxMegapixels: 2,
    supports: { negative: false, seed: true, edit: false, text: "средне" },
    bestFor: ["фотореализм", "резерв", "много вариантов", "сайт"],
    avoid: "текст",
    note: "FLUX dev через Replicate — тот же уровень, что и на fal.ai, с оплатой через Replicate.",
  },
  {
    id: "local-sdxl",
    label: "SDXL (локально, ComfyUI)",
    provider: "comfyui",
    apiModel: "sdxl",
    keyEnv: null,
    keyUrl: "https://github.com/comfyanonymous/ComfyUI",
    priceUsd: 0,
    quality: 3,
    speed: 2,
    sizeMode: "pixels",
    maxCount: 1,
    maxMegapixels: 2,
    supports: { negative: true, seed: true, edit: false, text: "средне" },
    bestFor: ["бесплатно", "приватно", "локально", "без интернета", "эксперименты"],
    avoid: "быстрая работа, слабая видеокарта",
    note: "Бесплатно на своей видеокарте (8 ГБ+). Нужен запущенный ComfyUI и чекпойнт SDXL. Качество ниже FLUX Pro, зато 0 $ и данные не уходят в интернет.",
  },
  {
    id: "local-flux",
    label: "FLUX.1 dev (локально, ComfyUI)",
    provider: "comfyui",
    apiModel: "flux",
    keyEnv: null,
    keyUrl: "https://github.com/comfyanonymous/ComfyUI",
    priceUsd: 0,
    quality: 4,
    speed: 1,
    sizeMode: "pixels",
    maxCount: 1,
    maxMegapixels: 2,
    supports: { negative: true, seed: true, edit: false, text: "средне" },
    bestFor: ["бесплатно", "приватно", "локально", "эксперименты"],
    avoid: "слабая видеокарта, быстрая работа",
    note: "Локальный FLUX. Требует свой workflow: экспортируй его из ComfyUI (Save API Format) и укажи путь в COMFYUI_FLUX_WORKFLOW. Без workflow использовать local-sdxl.",
  },
];

export const MODEL_IDS = MODELS.map((model) => model.id);

export const ASPECTS = ["1:1", "4:3", "3:2", "16:9", "21:9", "3:4", "2:3", "9:16"];

export const PRIORITIES = ["quality", "speed", "price", "text", "local", "draft"];

export function getModel(id) {
  const normalized = String(id || "").trim().toLowerCase();
  const found = MODELS.find((model) => model.id === normalized);
  if (found) return found;
  const byLabel = MODELS.find((model) => model.label.toLowerCase() === normalized);
  return byLabel ?? null;
}

export function formatPrice(usd) {
  if (!usd) return "0 $";
  return `$${usd < 0.01 ? usd.toFixed(3) : usd.toFixed(2)}`;
}

export function availability(model) {
  if (model.provider === "pollinations") return "бесплатно";
  if (!model.keyEnv) return "локально";
  return process.env[model.keyEnv] ? "ключ есть" : "нет ключа";
}

export function isAvailable(model) {
  return !model.keyEnv || Boolean(process.env[model.keyEnv]);
}

export function formatCatalogMarkdown(models = MODELS) {
  const lines = [
    "| id | Модель | Провайдер | Цена/шт | Качество | Скорость | Ключ |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const model of models) {
    lines.push(
      `| \`${model.id}\` | ${model.label} | ${model.provider} | ${formatPrice(model.priceUsd)} | ${model.quality}/5 | ${model.speed}/5 | ${availability(model)} |`,
    );
  }
  lines.push("");
  lines.push("Подробно — в описании каждой модели или через `recommend_model`.");
  return lines.join("\n");
}

export function formatModelDetails(model) {
  return [
    `**${model.label}** · \`${model.id}\``,
    `Провайдер: ${model.provider} · цена ≈ ${formatPrice(model.priceUsd)}/шт · качество ${model.quality}/5 · скорость ${model.speed}/5`,
    `Ключ: ${model.keyEnv ? `${model.keyEnv} (${availability(model)})` : "не нужен (локально)"}`,
    `Для чего: ${model.bestFor.join(", ")}.`,
    `Не использовать для: ${model.avoid}.`,
    `Особенности: ${model.note}`,
  ].join("\n");
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .split(/[^a-zа-яё0-9.+-]+/i)
    .filter((token) => token.length >= 3);
}

const PRIORITY_WEIGHTS = {
  quality: (model) => model.quality * 2,
  speed: (model) => model.speed * 2,
  price: (model) => Math.max(0, 6 - model.priceUsd * 100),
  text: (model) => ({ отлично: 8, хорошо: 5, средне: 2, слабо: 0 }[model.supports.text] ?? 0),
  local: (model) => (model.provider === "comfyui" ? 10 : -4),
  draft: (model) => (model.speed >= 4 && model.priceUsd <= 0.03 ? 8 : 0),
};

/**
 * Простой рекомендатор по текстовому запросу + приоритету.
 * Возвращает отсортированный список { model, score, reason }.
 */
export function recommendModels({ useCase = "", priority = "quality", limit = 3 } = {}) {
  const tokens = tokenize(useCase);
  const scored = MODELS.map((model) => {
    const haystack = tokenize(
      [model.label, model.note, model.bestFor.join(" "), model.avoid, model.provider].join(" "),
    );
    let score = 0;
    for (const token of tokens) {
      if (haystack.includes(token)) score += 3;
      else if (haystack.some((word) => word.startsWith(token) || token.startsWith(word))) score += 1;
    }
    score += (PRIORITY_WEIGHTS[priority] ?? PRIORITY_WEIGHTS.quality)(model);
    if (!isAvailable(model) && model.keyEnv) score -= 2;
    return { model, score };
  });

  scored.sort((a, b) => b.score - a.score || b.model.quality - a.model.quality);
  return scored.slice(0, limit).map(({ model, score }) => ({
    model,
    score,
    reason: buildReason(model, useCase, priority),
  }));
}

function buildReason(model, useCase, priority) {
  const parts = [];
  if (useCase) parts.push(`подходит под «${useCase}»`);
  if (priority === "price" || priority === "draft") parts.push(`дёшево/быстро (${formatPrice(model.priceUsd)})`);
  else if (priority === "speed") parts.push(`высокая скорость (${model.speed}/5)`);
  else if (priority === "text") parts.push(`текст на картинке: ${model.supports.text}`);
  else if (priority === "local") parts.push("работает локально, без оплаты за картинку");
  else parts.push(`качество ${model.quality}/5 за ${formatPrice(model.priceUsd)}`);
  if (!model.keyEnv) parts.push("ключ не нужен");
  else if (!process.env[model.keyEnv]) parts.push(`нужен ключ ${model.keyEnv}`);
  return parts.join("; ");
}

export function providerStatus() {
  const providers = new Map();
  for (const model of MODELS) {
    if (!model.keyEnv) continue;
    if (!providers.has(model.provider)) {
      providers.set(model.provider, {
        provider: model.provider,
        keyEnv: model.keyEnv,
        keyUrl: model.keyUrl,
        models: [],
        value: process.env[model.keyEnv],
      });
    }
    providers.get(model.provider).models.push(model.id);
  }
  return [...providers.values()].map((entry) => ({
    ...entry,
    masked: maskSecret(entry.value),
    ready: Boolean(entry.value),
  }));
}
