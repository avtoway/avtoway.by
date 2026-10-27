# imagegen MCP — генерация картинок прямо из OpenCode

Локальный MCP-сервер: принимает промпт, вызывает облачную (или локальную) модель,
сохраняет результат в `public/images/generated` в webp + адаптивные размеры + json с промптом.

Работает внутри OpenCode через `opencode.json` → инструменты `imagegen_*`.

## Быстрый старт

0. Зависимости (один раз, на новом клоне):
   ```
   cd mcp/imagegen
   npm install
   ```
1. Скопируй `.env.example` → `.env` в этой папке и вставь один ключ:
   ```
   FAL_KEY=...            # FLUX — основной вариант
   # или GOOGLE_API_KEY=  # Imagen, есть бесплатный лимит
   ```
2. Перезапусти OpenCode (MCP-сервер читает `.env` при старте).
3. В чате:
   ```
   imagegen_check_setup
   imagegen_generate_image prompt="professional photo of a black BMW at a car wash, golden hour, 35mm" aspect="16:9" count=2
   ```

Готовые файлы: `public/images/generated/`, URL: `/images/generated/<файл>.webp`.

> **Бесплатный вариант:** `pollinations-flux` работает без ключа, но classic API Pollinations может требовать pollen key/оплату (`https://enter.pollinations.ai`). Для стабильной генерации добавьте `FAL_KEY` или `GOOGLE_API_KEY`.

## Инструменты

| Инструмент | Зачем |
|---|---|
| `list_models` | Каталог: id, цена, качество, скорость, для чего подходит. Фильтр: `filter="текст"` |
| `recommend_model` | Подбор модели под задачу: `use_case`, `priority` = quality/speed/price/text/local/draft |
| `generate_image` | Генерация 1–4 картинок + сохранение |
| `edit_image` | Редактирование существующей картинки (только `gpt-image-1`) |
| `list_generated` | Что уже сгенерировано, чтобы не рисовать заново |
| `check_setup` | Какие ключи есть, куда пишутся файлы, запущен ли ComfyUI |

### generate_image

```
prompt           описание (лучше по-английски)
model            id из list_models (по умолчанию flux-1.1-pro)
negative_prompt  чего не должно быть
aspect           1:1 | 4:3 | 3:2 | 16:9 | 21:9 | 3:4 | 2:3 | 9:16
width / height   точный размер вместо aspect
count            1–4
seed             для повторяемости
quality          low | medium | high (gpt-image-1, ideogram, ComfyUI)
filename         имя файла без расширения
folder           подпапка внутри generated (cars, services, hero)
```

## Модели и когда что брать

| id | Цена/шт | Когда |
|---|---|---|
| `flux-1.1-pro` | ~$0.04 | **Дефолт.** Фотореализм: авто, интерьеры, люди, баннеры |
| `flux-1.1-ultra` | ~$0.06 | Максимум качества, до 4 МП, печать, главный баннер |
| `flux-schnell` | ~$0.003 | Черновики, перебор 10 идей композиции |
| `flux-dev` | ~$0.025 | Дешевле Pro, много вариантов |
| `flux-pro-bfl` / `flux-ultra-bfl` | ~$0.04 / 0.06 | То же через BFL напрямую (по 1 шт. за запрос) |
| `imagen-4` / `imagen-4-ultra` / `imagen-4-fast` | $0.02–0.06 | Чистые коммерческие кадры, есть бесплатный лимит Google |
| `gpt-image-1` | $0.02–0.19 | Сложные инструкции, текст на картинке, **редактирование** |
| `ideogram-3` | ~$0.05 | Логотипы, вывески, типографика, negative prompt |
| `seedream-3` | ~$0.03 | Дешёвый фотореализм, портреты |
| `recraft-v3` | ~$0.04 | Дизайн, иконки, вектор, плоские стили |
| `replicate-flux-schnell/dev` | $0.003–0.025 | FLUX через Replicate |
| `local-sdxl` | 0 | Бесплатно на своей GPU (ComfyUI, 8 ГБ+) |
| `local-flux` | 0 | Локальный FLUX, нужен свой workflow |

## Как писать промпты

Схема: **объект + окружение + свет + ракурс/оптика + стиль + качество**.

```
professional photo of a black BMW 5 series parked at a modern self-service car wash,
wet asphalt reflections, golden hour, low angle, 35mm lens, shallow depth of field,
clean composition, commercial photography, high detail
```

Плохо: `красивая машина`.
Хорошо: `black BMW, modern car wash, evening, neon reflections, wide shot`.

Для сайта:
- баннер — `16:9` или `21:9`, без текста (текст накладывается в вёрстке);
- карточка услуги — `4:3`;
- сторис/мобильный блок — `9:16`.

Текст на картинке генерируй только `ideogram-3` или `gpt-image-1`; у FLUX буквы «плывут».

## Связка с текущим pipeline сайта (`assets-src` + `npm run images:build`)

В проекте уже есть сборка картинок из `assets-src/services/*` в `public/images/services/` (1600×900 WebP + OG + иконки).
Два способа подружить:

1. **Через `generated` (проще).** Генерируешь в `public/images/generated`, вставляешь URL напрямую в `next/image`.
2. **Через существующую сборку.** Сгенерируй с `filename=rent` и `aspect=16:9`, затем:
   ```
   copy public\images\generated\rent.webp assets-src\services\rent.webp
   npm run images:build
   npm run images:apply   # если нужно записать photo в БД
   ```
   Либо сразу пиши в `assets-src/services`: `IMAGEGEN_OUTPUT_DIR=...\assets-src\services` в `.env`
   (сервер всё равно сделает webp, сборка его примет).

Стиль сайта (тёмный фон, красный акцент) — см. `PROMPTS.md`, раздел «Фирменный стиль AVTOWAY».

## Что сохраняется

```
public/images/generated/
  flux-1.1-pro-2026-10-26T12-00-00-hero-rent-ab12.webp   ← 1600×900, q90
  ...-hero-rent-ab12@1024.webp                          ← адаптив для next/image
  ...-hero-rent-ab12@640.webp
  ...-hero-rent-ab12.json                               ← промпт, модель, seed, цена
```

Использование в Next.js:

```tsx
import Image from "next/image";

<Image
  src="/images/generated/flux-1.1-pro-...-hero-rent-ab12.webp"
  alt="Аренда автомобиля"
  width={1600}
  height={900}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## Локальный ComfyUI (бесплатно)

1. Запусти ComfyUI (`python main.py`), по умолчанию `http://127.0.0.1:8188`.
2. Скачай чекпойнт SDXL в `ComfyUI/models/checkpoints/`.
3. В `.env`:
   ```
   COMFYUI_URL=http://127.0.0.1:8188
   COMFYUI_CHECKPOINT=sd_xl_base_1.0.safetensors
   ```
4. `model: "local-sdxl"`.

Для FLUX: собери workflow в ComfyUI → **Export (API)** → путь в `COMFYUI_FLUX_WORKFLOW`,
модель `local-flux`. В workflow можно использовать плейсхолдеры `{{PROMPT}}`, `{{NEGATIVE}}`,
`{{WIDTH}}`, `{{HEIGHT}}`, `{{SEED}}`.

## Команды

```
npm run models        # таблица моделей в консоли
npm run smoke         # проверка MCP: tools/list + вызовы без генерации
npm run test-storage  # проверка webp/адаптива/json/превью
npm start             # запустить сервер вручную (для отладки)
```

## Если что-то не работает

| Симптом | Причина / решение |
|---|---|
| `Не задан ключ FAL_KEY` | добавь ключ в `mcp/imagegen/.env`, перезапусти OpenCode |
| Инструментов `imagegen_*` нет в чате | проверь `opencode.json`, перезапусти OpenCode, `check_setup` |
| `HTTP 401/403` | ключ неверный или закончился баланс |
| `HTTP 422` | модель не приняла параметр (обычно aspect) — попробуй другой aspect |
| Долго (>2 мин) | FLUX Ultra/BFL медленные; для черновика `flux-schnell` |
| `local-sdxl` не работает | ComfyUI не запущен / нет чекпойнта / неверное имя файла |
| Кириллица в промпте | модели понимают, но английский даёт стабильнее результат |

## Безопасность

- Ключи только в `.env` (в git не попадает — проверь `.gitignore`).
- Сервер пишет только внутрь `public/images/generated` (защита от `../`).
- Наружу ничего не отдаётся: это локальный stdio-процесс.
- Для продакшена нужен отдельный API-роут — этот сервер для локальной работы.

## Добавить новую модель

1. Добавь запись в `lib/catalog.mjs` (id, provider, apiModel, цена, bestFor).
2. Если провайдер новый — файл в `providers/` с функцией `generate({model, prompt, ...})`,
   вернуть `{images: [{url|base64|buffer}], extra}`.
3. Зарегистрируй в `providers/index.mjs`.
4. `npm run smoke`.
