#!/usr/bin/env node
/**
 * MCP-сервер генерации изображений для проекта avtoway.by.
 *
 * Инструменты:
 *   list_models      — каталог моделей с описанием и рекомендациями
 *   recommend_model  — подбор модели под задачу
 *   generate_image   — генерация и сохранение в public/images/generated
 *   edit_image       — редактирование картинки (gpt-image-1)
 *   list_generated   — что уже сгенерировано
 *   check_setup      — какие ключи/папки настроены
 */
import { relative } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  ASPECTS,
  MODELS,
  MODEL_IDS,
  PRIORITIES,
  availability,
  formatCatalogMarkdown,
  formatModelDetails,
  formatPrice,
  getModel,
  isAvailable,
  providerStatus,
  recommendModels,
} from "./lib/catalog.mjs";
import { generateImages, editImage } from "./lib/generate.mjs";
import { listGenerated, outputDirInfo } from "./lib/storage.mjs";
import { LOADED_ENV_FILES, OUTPUT_ROOT, PROJECT_ROOT } from "./lib/env.mjs";
import { errorToText } from "./lib/errors.mjs";
import { systemStats } from "./providers/comfyui.mjs";

const log = (message) => process.stderr.write(`[imagegen] ${message}\n`);

function text(value) {
  return { content: [{ type: "text", text: value }] };
}

function failure(error) {
  const known = ["MissingKeyError", "ProviderError", "ValidationError"];
  if (known.includes(error?.name)) log(`ошибка: ${String(error.message).split("\n")[0]}`);
  else log(`ошибка: ${error?.stack || error?.message || error}`);
  return { isError: true, content: [{ type: "text", text: errorToText(error) }] };
}

function relPath(absolutePath) {
  return relative(PROJECT_ROOT, absolutePath).replace(/\\/g, "/");
}

function formatGenerateResult(result) {
  const { model, size, saved, meta } = result;
  const lines = [
    `Готово: ${result.count} изобр. · ${model.label} (\`${model.id}\`) · ${size.width}x${size.height}`,
    "",
  ];

  if (!saved) {
    lines.push("Режим save=false: файлы не записаны, только метаданные.");
    lines.push(`Промпт: ${meta.prompt}`);
    lines.push(`Оценка стоимости: ${formatPrice(meta.priceUsd)}`);
    return lines.join("\n");
  }

  saved.files.forEach((file, index) => {
    lines.push(`${index + 1}. ${file.url}`);
    lines.push(`   файл: ${relPath(file.path)} · ${file.width}x${file.height} · ${(file.bytes / 1024).toFixed(0)} КБ`);
    if (file.variants.length) {
      lines.push(`   адаптивные: ${file.variants.map((variant) => `${variant.width}px`).join(", ")}`);
    }
  });

  lines.push("");
  lines.push(`Метаданные: ${relPath(saved.metaPath)}`);
  lines.push(`Промпт: ${meta.prompt}`);
  if (meta.negativePrompt) lines.push(`Negative: ${meta.negativePrompt}`);
  if (meta.seed !== null && meta.seed !== undefined) lines.push(`Seed: ${meta.seed}`);
  lines.push(`Оценка стоимости: ${formatPrice(meta.priceUsd)}`);

  return lines.join("\n");
}

const server = new McpServer(
  { name: "imagegen", version: "1.0.0" },
  {
    instructions: [
      "Генерация изображений для сайта avtoway.by.",
      "Картинки сохраняются в public/images/generated (webp + адаптивные размеры + json с промптом).",
      "Порядок работы: 1) list_models или recommend_model — выбрать модель; 2) generate_image; 3) вставить полученный URL в next/image.",
      "Для черновиков используй flux-schnell (дёшево), для финала — flux-1.1-pro / imagen-4, для текста на картинке — ideogram-3 или gpt-image-1.",
      "Если нет ключа API, инструмент подскажет, какой ключ и куда положить.",
    ].join("\n"),
  },
);

server.registerTool(
  "list_models",
  {
    title: "Каталог моделей генерации",
    description:
      "Показывает все доступные модели: id, провайдер, цена, качество, скорость, для чего подходит и чего избегать.\n\n" +
      "Вызывай этот инструмент ПЕРВЫМ, если пользователь спрашивает «какие есть модели», «чем генерить», " +
      "или если нужно понять, какой model-id передать в generate_image.\n\n" +
      "Параметры:\n" +
      "  filter — необязательный поиск по id/названию/назначению (например «текст», «черновик», «авто»)\n" +
      "  format — markdown (таблица) или json (для программной обработки)",
    inputSchema: {
      filter: z.string().optional().describe("Поиск по id, названию, провайдеру или назначению: авто, текст, черновик, локально"),
      format: z.enum(["markdown", "json"]).default("markdown").describe("markdown — таблица для человека, json — структурированные данные"),
    },
  },
  async ({ filter, format }) => {
    try {
      const query = String(filter ?? "").trim().toLowerCase();
      const models = query
        ? MODELS.filter((model) =>
            [model.id, model.label, model.provider, model.note, model.bestFor.join(" "), model.avoid]
              .join(" ")
              .toLowerCase()
              .includes(query),
          )
        : MODELS;

      if (!models.length) {
        return text(`По фильтру «${filter}» ничего не найдено. Доступные id: ${MODEL_IDS.join(", ")}`);
      }

      if (format === "json") {
        return text(
          JSON.stringify(
            models.map((model) => ({
              id: model.id,
              label: model.label,
              provider: model.provider,
              priceUsd: model.priceUsd,
              quality: model.quality,
              speed: model.speed,
              bestFor: model.bestFor,
              avoid: model.avoid,
              note: model.note,
              keyEnv: model.keyEnv,
              keyReady: isAvailable(model),
            })),
            null,
            2,
          ),
        );
      }

      if (query) {
        return text(models.map(formatModelDetails).join("\n\n---\n\n"));
      }

      const withKey = MODELS.filter((model) => model.keyEnv && process.env[model.keyEnv]).length;
      const localModels = MODELS.filter((model) => !model.keyEnv).length;
      return text(
        [
          `Моделей в каталоге: ${MODELS.length}. С ключом API: ${withKey}. Локальных (ComfyUI): ${localModels}.`,
          "",
          formatCatalogMarkdown(models),
          "",
          "Что выбрать:",
          "• фотовый сайт, авто, интерьеры — flux-1.1-pro (финал) / flux-schnell (черновик)",
          "• максимум качества и 4 МП — flux-1.1-ultra",
          "• дешёвый старт с бесплатным лимитом — imagen-4 (ключ Google AI Studio)",
          "• текст/логотип на картинке — ideogram-3 или gpt-image-1",
          "• дизайн, иконки, вектор — recraft-v3",
          "• бесплатно и приватно — local-sdxl (ComfyUI)",
          "",
          "Подробнее по конкретной модели: list_models(filter=\"flux\"). Подбор под задачу: recommend_model.",
          "Проверка ключей: check_setup.",
        ].join("\n"),
      );
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "recommend_model",
  {
    title: "Подобрать модель под задачу",
    description:
      "Подбирает 1–5 моделей под описание задачи и приоритет. Возвращает id, обоснование, цену и готовый JSON-вызов generate_image.\n\n" +
      "Когда использовать: пользователь говорит «хочу обложку для аренды», «нужен логотип», «подешевле», " +
      "«побыстрее», «без интернета/локально».\n\n" +
      "priority:\n" +
      "  quality — максимальное качество (по умолчанию)\n" +
      "  speed   — быстрее\n" +
      "  price   — дешевле\n" +
      "  text    — нужен текст/надписи на картинке\n" +
      "  local   — без облака, на своей видеокарте\n" +
      "  draft   — черновики и перебор идей",
    inputSchema: {
      use_case: z.string().describe("Что нужно нарисовать: «фото авто в Москве для страницы аренды», «логотип детейлинг-центра», «иконки услуг»"),
      priority: z.enum(PRIORITIES).default("quality").describe("Приоритет выбора"),
      limit: z.number().int().min(1).max(5).default(3).describe("Сколько вариантов показать"),
    },
  },
  async ({ use_case, priority, limit }) => {
    try {
      const picks = recommendModels({ useCase: use_case, priority, limit });
      const blocks = picks.map((pick, index) => {
        const model = pick.model;
        return [
          `${index + 1}. \`${model.id}\` — ${model.label}`,
          `   ${pick.reason}`,
          `   Цена ≈ ${formatPrice(model.priceUsd)}/шт · качество ${model.quality}/5 · скорость ${model.speed}/5`,
          `   Ключ: ${model.keyEnv ? `${model.keyEnv} (${availability(model)})` : "не нужен (локально)"}`,
          `   Пример вызова: {"model":"${model.id}","prompt":"${use_case || "описание сцены"}","aspect":"16:9","count":2}`,
        ].join("\n");
      });

      const missing = picks.filter((pick) => pick.model.keyEnv && !isAvailable(pick.model));
      const lines = [
        `Задача: ${use_case || "не указана"} · приоритет: ${priority}`,
        "",
        ...blocks,
      ];

      if (missing.length) {
        lines.push("");
        lines.push("Не хватает ключей:");
        for (const pick of missing) {
          lines.push(`• ${pick.model.keyEnv} → ${pick.model.keyUrl} (файл mcp/imagegen/.env)`);
        }
      }

      lines.push("");
      lines.push("Дальше: generate_image с выбранным model. Готовые файлы появятся в public/images/generated.");
      return text(lines.join("\n"));
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "generate_image",
  {
    title: "Сгенерировать изображение",
    description:
      "Генерирует 1–4 изображения и сохраняет их в public/images/generated: webp основного размера, адаптивные @1024/@640, json с промптом и seed.\n\n" +
      "Возвращает URL для <Image src=\"...\">, путь к файлу и превью.\n\n" +
      "Как выбирать model:\n" +
      "  flux-1.1-pro      — универсальный фотореализм (по умолчанию)\n" +
      "  flux-1.1-ultra    — максимум качества / 4 МП / печать\n" +
      "  flux-schnell      — черновики и перебор идей (в 10 раз дешевле)\n" +
      "  imagen-4[-ultra|-fast] — чистые коммерческие кадры, ключ Google\n" +
      "  gpt-image-1       — сложные инструкции и текст на картинке\n" +
      "  ideogram-3        — логотипы, вывески, типографика\n" +
      "  seedream-3        — дешёвый фотореализм\n" +
      "  recraft-v3        — дизайн, иконки, вектор\n" +
      "  local-sdxl / local-flux — бесплатно локально (ComfyUI)\n\n" +
      "Советы по промпту: пиши на английском, указывай объект, место, свет, ракурс, объектив и стиль. " +
      "Например: «professional photo of a black BMW 5 series parked at a modern car wash, golden hour, shallow depth of field, 35mm». " +
      "Для сайта аспект 16:9 (баннеры) или 4:3 (карточки).",
    inputSchema: {
      prompt: z.string().min(3).describe("Описание картинки. Лучше на английском, с деталями: объект, свет, ракурс, стиль"),
      model: z.enum(MODEL_IDS).default("flux-1.1-pro").describe("id модели из list_models"),
      negative_prompt: z.string().optional().describe("Что НЕ должно быть на картинке (поддерживают не все модели — остальным добавляется в конец промпта)"),
      aspect: z.enum(ASPECTS).default("16:9").describe("Соотношение сторон: 16:9 баннер, 4:3 карточка, 1:1 квадрат, 9:16 сторис"),
      width: z.number().int().min(256).max(2048).optional().describe("Ширина в пикселях (вместо aspect), кратна 16"),
      height: z.number().int().min(256).max(2048).optional().describe("Высота в пикселях (вместо aspect), кратна 16"),
      count: z.number().int().min(1).max(4).default(1).describe("Сколько вариантов сгенерировать"),
      seed: z.number().int().min(0).max(4_294_967_295).optional().describe("Seed для повторяемости результата"),
      quality: z.enum(["low", "medium", "high"]).optional().describe("Качество/скорость: влияет на gpt-image-1, ideogram-3, ComfyUI"),
      filename: z.string().optional().describe("Имя файла без расширения, например hero-rent-minsk"),
      folder: z.string().optional().describe("Подпапка внутри public/images/generated, например cars или services"),
      save: z.boolean().default(true).describe("false — не сохранять на диск (только вернуть метаданные)"),
      preview: z.boolean().default(true).describe("Показывать превью картинки в ответе"),
    },
  },
  async (args) => {
    try {
      const result = await generateImages(args);
      const content = [{ type: "text", text: formatGenerateResult(result) }];
      if (args.preview && result.saved?.preview) {
        content.push({ type: "image", data: result.saved.preview.data, mimeType: result.saved.preview.mimeType });
      }
      return { content };
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "edit_image",
  {
    title: "Отредактировать изображение",
    description:
      "Меняет существующую картинку по текстовой инструкции: заменить фон, убрать объект, добавить элемент, сменить стиль. " +
      "Работает только с моделью gpt-image-1 (нужен OPENAI_API_KEY).\n\n" +
      "image_path — локальный путь (например public/images/generated/hero.webp) или https-URL.\n" +
      "Результат сохраняется рядом с остальными картинками, оригинал не меняется.",
    inputSchema: {
      image_path: z.string().describe("Путь к исходной картинке или https-URL"),
      prompt: z.string().min(3).describe("Что изменить: «replace the background with a modern car wash at night», «remove the person on the left»"),
      model: z.enum(["gpt-image-1"]).default("gpt-image-1").describe("Модель редактирования"),
      aspect: z.enum(ASPECTS).default("1:1").describe("Итоговое соотношение сторон"),
      quality: z.enum(["low", "medium", "high"]).optional().describe("Качество результата"),
      count: z.number().int().min(1).max(4).default(1).describe("Сколько вариантов"),
      filename: z.string().optional().describe("Имя файла без расширения"),
      folder: z.string().optional().describe("Подпапка в public/images/generated"),
      save: z.boolean().default(true).describe("false — не сохранять"),
      preview: z.boolean().default(true).describe("Показывать превью"),
    },
  },
  async (args) => {
    try {
      const result = await editImage(args);
      const lines = [
        `Готово: ${result.count} изобр. · ${result.model.label} (edit)`,
        "",
      ];
      if (result.saved) {
        lines.push(...result.saved.files.map((file, index) => `${index + 1}. ${file.url}`));
        lines.push("");
        lines.push(`Метаданные: ${relPath(result.saved.metaPath)}`);
      } else {
        lines.push("Режим save=false: файлы не записаны.");
      }
      lines.push(`Промпт: ${result.meta.prompt}`);
      const content = [{ type: "text", text: lines.join("\n") }];
      if (args.preview && result.saved?.preview) {
        content.push({ type: "image", data: result.saved.preview.data, mimeType: result.saved.preview.mimeType });
      }
      return { content };
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "list_generated",
  {
    title: "Список сгенерированных картинок",
    description:
      "Показывает, что уже лежит в public/images/generated: URL, размер, дата, модель и промпт. " +
      "Полезно, чтобы переиспользовать готовую картинку вместо повторной генерации.",
    inputSchema: {
      folder: z.string().optional().describe("Ограничить подпапкой, например cars"),
      limit: z.number().int().min(1).max(100).default(20).describe("Сколько последних картинок показать"),
    },
  },
  async ({ folder, limit }) => {
    try {
      const items = await listGenerated({ folder: folder ?? "", limit });
      if (!items.length) {
        return text(`В ${relPath(OUTPUT_ROOT)}${folder ? `/${folder}` : ""} пока пусто. Сгенерируй первую картинку через generate_image.`);
      }
      const lines = [`Найдено: ${items.length} (последние сверху)`, ""];
      items.forEach((item, index) => {
        lines.push(`${index + 1}. ${item.url}`);
        lines.push(`   ${item.createdAt} · ${item.model ?? "?"} · ${item.width ?? "?"}x${item.height ?? "?"} · ${(item.bytes / 1024).toFixed(0)} КБ`);
        if (item.prompt) lines.push(`   ${item.prompt.slice(0, 160)}`);
        if (item.variants.length) lines.push(`   варианты: ${item.variants.join(", ")}`);
      });
      return text(lines.join("\n"));
    } catch (error) {
      return failure(error);
    }
  },
);

server.registerTool(
  "check_setup",
  {
    title: "Проверить настройку",
    description:
      "Показывает, какие ключи API найдены, какие нет, куда сохраняются картинки, доступен ли локальный ComfyUI. " +
      "Вызывай, если генерация падает с ошибкой ключа или нужно понять, чего не хватает для старта.",
    inputSchema: {},
  },
  async () => {
    try {
      const dir = await outputDirInfo();
      const providers = providerStatus();
      const comfy = await systemStats();
      const readyProviders = providers.filter((entry) => entry.ready).length;

      const lines = [
        "Настройка imagegen MCP",
        "",
        `Node.js: ${process.version} · платформа: ${process.platform}`,
        `Корень проекта: ${PROJECT_ROOT}`,
        `Папка результатов: ${OUTPUT_ROOT}`,
        `Запись в папку: ${dir.ok ? "работает" : `ОШИБКА — ${dir.error}`}`,
        `Прочитанные .env: ${LOADED_ENV_FILES.length ? LOADED_ENV_FILES.map(relPath).join(", ") : "нет"}`,
        "",
        "Провайдеры и ключи:",
      ];

      for (const entry of providers) {
        lines.push(
          `${entry.ready ? "[есть]" : "[нет] "} ${entry.provider}: ${entry.keyEnv} = ${entry.masked}`,
        );
        lines.push(`        модели: ${entry.models.join(", ")}`);
        if (!entry.ready) lines.push(`        получить ключ: ${entry.keyUrl}`);
      }

      lines.push("");
      lines.push(
        `Локальный ComfyUI (${comfy.url}): ${comfy.online ? `доступен, устройств: ${comfy.devices ?? "?"}` : "не запущен"}`,
      );
      if (!comfy.online) lines.push("  для local-sdxl запусти ComfyUI и проверь COMFYUI_URL");

      lines.push("");
      if (readyProviders === 0 && !comfy.online) {
        lines.push("ИТОГ: пока не с чем работать. Добавь хотя бы один ключ:");
        lines.push("  1) Создай файл mcp/imagegen/.env");
        lines.push("  2) Вставь строку, например: FAL_KEY=твой_ключ (https://fal.ai/dashboard/keys)");
        lines.push("  3) Перезапусти OpenCode");
        lines.push("Самый простой старт: GOOGLE_API_KEY из https://aistudio.google.com/apikey — есть бесплатный лимит на Imagen.");
      } else {
        lines.push("ИТОГ: можно генерировать. Начни с recommend_model или сразу generate_image.");
      }

      lines.push("");
      lines.push("Полезные команды:");
      lines.push("  npm run models  — таблица моделей в консоли");
      lines.push("  npm run smoke   — самопроверка MCP-сервера");

      return text(lines.join("\n"));
    } catch (error) {
      return failure(error);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log(`запущен · моделей: ${MODELS.length} · результатов: ${OUTPUT_ROOT}`);
  log(`модели: ${MODEL_IDS.filter((id) => getModel(id)).length}, с ключом: ${MODELS.filter((model) => model.keyEnv && process.env[model.keyEnv]).length}`);
}

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

main().catch((error) => {
  log(`не удалось запустить: ${error?.stack || error}`);
  process.exit(1);
});
