# Бриф на изображения АВТОWAY

Коротко: сгенерируйте 6 обложек услуг в одном стиле, положите в `assets-src/services/` под нужными именами и выполните `npm run images:apply`. Всё остальное (WebP 1600×900, OG-картинка, иконки, заглушка) уже делает скрипт.

---

## 1. Что нужно

| # | Файл | Куда попадёт | Размер | Обязательно |
|---|---|---|---|---|
| 1 | `assets-src/services/rent.jpg` | `/services`, `/services/rent`, hero на карточке авто | 1600×900 | да |
| 2 | `assets-src/services/sell.jpg` | `/services`, `/services/sell` | 1600×900 | да |
| 3 | `assets-src/services/inspection.jpg` | `/services`, `/services/inspection` | 1600×900 | да |
| 4 | `assets-src/services/truck.jpg` | `/services/truck` (услуга скрыта, но фото готовим) | 1600×900 | желательно |
| 5 | `assets-src/services/import.jpg` | `/services/import` | 1600×900 | желательно |
| 6 | `assets-src/services/service.jpg` | `/services/service` | 1600×900 | желательно |
| 7 | `assets-src/og.jpg` | превью ссылки в Telegram / соцсетях | 1200×630 | опционально* |

\* Если `assets-src/og.jpg` нет — скрипт сам соберёт OG из `public/videos/hero-poster.jpg` (уже сделано). Своя картинка будет лучше.

Расширение любое: `.jpg`, `.png`, `.webp` — имя файла важнее (`rent`, `sell`, …).

Скрипт сам:
- приводит всё к 1600×900 (cover, без искажений),
- конвертирует в WebP ≤ 300 КБ,
- срезает нижнюю полосу, если нужно убрать watermark (`--crop-bottom=9`),
- делает `icon.png`, `apple-icon.png`, `favicon.ico`, `opengraph-image.jpg`, `twitter-image.jpg`, `placeholder-car.webp`,
- с флагом `--apply` прописывает пути в `services.photo` в БД.

---

## 2. Единый стиль (обязательно для всех 6)

Сайт тёмный (`zinc-950`), акцент — красный `#ef4444`. Обложки должны читаться как одна рекламная кампания.

**Что должно быть на каждой картинке:**
- тёмная среда: чёрный / графит / мокрый бетон / ночная улица;
- **один** источник красного акцентного света (rim light, подсветка, фара, лампа);
- глубина: размытый передний/задний план, дымка, отражения на полу;
- фотореализм, репортажная «киношная» картинка, не 3D-рендер и не иллюстрация;
- главный объект чуть правее центра, **левая треть — спокойная тёмная зона** (туда ляжет заголовок);
- 16:9, горизонтальный кадр.

**Чего быть не должно:**
- текст, буквы, watermark, логотипы и эмблемы брендов;
- читаемые номерные знаки (или любые номера);
- лица крупным планом (люди — со спины, в расфокусе, в каске);
- искажённые колёса/кузов, «лишние» детали, пластик вместо металла;
- кислотные цвета, пересвет, дешёвый стоковый вид.

---

## 3. Промпты

Склеивайте так: **`<промпт услуги>` + `, ` + `<STYLE BLOCK>`**. Промпты на английском — модели понимают его лучше и стабильнее.

### STYLE BLOCK (добавлять в конец каждого промпта)

```
cinematic automotive photography, dark moody atmosphere, deep blacks and charcoal grey environment, single crimson red accent light, wet reflective floor, volumetric haze, shallow depth of field, 35mm full-frame look, crisp detail, professional advertising campaign, wide 16:9 composition, main subject right of centre, clean dark negative space on the left, photorealistic, no text, no letters, no watermark, no logos, no brand emblems, no license plates
```

### 1. Аренда — `rent`

Смысл: машина готова к выдаче, ключи, паркинг.

```
A row of clean modern rental sedans in a dark underground parking garage, one silver sedan in the foreground with headlights on and a key fob hanging in the blurred foreground, red rim light tracing the body lines, wet concrete floor with reflections, sense of freedom and availability
```

Вариации: `person handing car keys to a client, both hands in focus, faces out of frame` · `convertible with the top down at night in the city`.

### 2. Продажа авто — `sell`

Смысл: авто на подиуме, как в шоуруме.

```
A single clean used car presented on a dark showroom podium, three-quarter front view, soft top light with a red edge light, glossy black floor with reflections, premium dealership atmosphere, no price tags
```

Вариации: `car with a subtle "for sale" mood, keys and documents on a dark table in the foreground`.

### 3. Автоподбор / осмотр — `inspection`

Смысл: эксперт с фонарём и планшетом у открытого капота.

```
Close-up of a mechanic's gloved hands holding a flashlight and a tablet while inspecting the engine bay of a car in a dim workshop, warm work lamp glow mixed with a red accent, shallow depth of field, diagnostic and trustworthy mood
```

Вариации: `inspector under the car on a lift with a flashlight` · `thickness gauge on a car door, macro`.

### 4. Эвакуатор — `truck`

Смысл: ночная трасса, погрузка.

```
A modern flatbed tow truck with a car loaded on it, standing on a wet night road, amber and red warning lights glowing, headlights cutting through fog, dramatic cinematic mood
```

Вариации: `tow truck operator securing straps in the rain, close-up of hands and chains`.

### 5. Автопригон — `import`

Смысл: автовоз, дорога, Европа.

```
A car transporter truck fully loaded with cars driving on a European highway at dusk, motion blur on the road, headlights and red taillights, moody overcast sky, sense of a long journey
```

Вариации: `car on a ferry deck at dawn` · `border checkpoint at night, red lights`.

### 6. Автосервис — `service`

Смысл: чистый цех, подъёмник, механик.

```
A car raised on a lift in a clean modern service workshop, a mechanic working underneath with a work lamp, dark grey walls, red tool cabinets, professional atmosphere, cinematic lighting
```

Вариации: `macro of a torque wrench on a wheel hub` · `engine bay after repair, clean and detailed`.

### 7. OG-картинка — `assets-src/og.jpg` (1200×630)

Вариант A (проще): возьмите любую готовую обложку и обрежьте по центру.
Вариант B (лучше): сгенерируйте отдельно:

```
Cinematic wide banner of a dark automotive scene, silhouette of a modern car with a subtle red rim light, wet asphalt, large clean empty dark space on the left for a logo, premium brand mood
```

Текст на OG добавлять **не нужно** — он уже есть в шаблоне, а генераторы плохо пишут по-русски. Если хотите свой текст — соберите в Photoshop/Figma на тёмной плашке слева.

### Негативный промпт (если поле есть)

```
text, letters, watermark, logo, brand emblem, license plate, numbers, deformed car, extra wheels, distorted proportions, cartoon, 3d render, illustration, oversaturated, hdr artifacts, cluttered background, low quality, jpeg artifacts, people looking at camera
```

---

## 4. Настройки и консистентность

- **Соотношение сторон:** 16:9 (или 3:2 с последующим кадрированием — скрипт обрежет).
- **Разрешение:** просите 2K (2048 px по длинной стороне) или больше. 1024×576 тоже подойдёт, но после апскейла будет мягче.
- **Seed:** зафиксируйте один seed на все 6 картинок — так композиция и свет будут ближе.
- **Референс стиля:** сгенерируйте первую удачную обложку и передайте её как style reference для остальных:
  - Midjourney: `--sref <url или id>` + `--sw 150`;
  - FLUX / fal.ai: image prompt / `redux` / `kontext`;
  - Nano Banana Pro: «edit with reference image», приложите первую обложку;
  - Leonardo: Image Guidance + Style Reference;
  - ChatGPT / Gemini в чате: «сохрани тот же стиль, свет и цветовую гамму, поменяй только сюжет».
- **Итерации:** генерируйте по 2–4 варианта на услугу, выбирайте по чек-листу из §6.

---

## 5. Модели и сервисы

### Бесплатно

| Сервис | Модель | Лимиты | Плюсы / минусы |
|---|---|---|---|
| **Pollinations** (`image.pollinations.ai`) | FLUX / Sana | 1 картинка / 45 сек, до 1024 px | без регистрации, но watermark в правом нижнем углу → `--crop-bottom=9`; качество среднее |
| **Microsoft Copilot / Bing Image Creator** | DALL·E 3 | ~15 «boost» в день | бесплатно, хорошо понимает описания; чаще квадрат — кадрируйте |
| **Google AI Studio** | Gemini Image | в API бесплатного тарифа на image-модели нет, в студии можно пробовать | отличное качество и работа по референсу |
| **Leonardo.ai** | Phoenix / FLUX | ~150 токенов в день | хороший контроль стиля, коммерческое использование — проверьте условия тарифа |
| **Ideogram** | Ideogram 3 | ~10 медленных картинок в день | лучший по тексту (нам не нужен) |
| **Krea** | FLUX / Krea | дневные кредиты | приятная «киношная» эстетика |
| **Recraft** | Recraft V3 | 50 кредитов в день | вектор/иконки, если понадобится логотип |
| **Hugging Face Spaces** | FLUX.1 schnell | очередь | бесплатно, но медленно |

### Платно (цены — ориентир на 26.10.2026, проверяйте на сайте)

| Сервис / модель | Цена за картинку | Комментарий |
|---|---|---|
| **fal.ai · FLUX.1 [schnell]** | ~$0.003 / МП (~$0.005 за 1600×900) | самый дешёвый, качество ниже, детали иногда «плывут» |
| **fal.ai · Z-Image Turbo** | ~$0.005 / МП | быстрый бюджетный вариант |
| **fal.ai · Nano Banana** (Gemini 2.5 Flash Image) | $0.0398 | уверенно держит референс, хорош для серии |
| **fal.ai · Nano Banana 2** | $0.08 | лучше детализация и текст |
| **fal.ai · Nano Banana Pro** | $0.15 | максимум качества и точность по референсу |
| **fal.ai · GPT Image 2** | $1 / единица | дорого, но очень аккуратные сложные сцены |
| **Google · Nano Banana 2.1** | $0.0336 (1K) · $0.0504 (2K) · $0.113 (4K) | напрямую через Gemini API |
| **Google · Nano Banana 2** (Gemini 3.1 Flash Image) | $0.067 (1K) · $0.101 (2K) · $0.151 (4K) | 2K — оптимум для сайта |
| **Google · Nano Banana 2 Lite** | $0.0336 (1K) | дешевле, качество чуть ниже |
| **OpenAI · gpt-image-1 / GPT Image** | ~$0.04–0.17 | сильно зависит от качества и размера |
| **Midjourney** | $10 / $30 / $60 / $120 в месяц | нет API, но лучший художественный вкус и `--sref` для серии |
| **Leonardo** | от $12/мес | + приватность и коммерческая лицензия |
| **Ideogram** | от $8/мес | если нужен текст на картинке |
| **Recraft** | от $12/мес | иконки, вектор, фирменный стиль |
| **Krea** | от $10/мес | апскейл и стилизация |
| **Freepik** | от ~$8/мес | много моделей в одной подписке |

**Что бы я выбрал:**
- разово, 6 обложек — **Nano Banana 2 на fal.ai ($0.08)** ≈ **$0.5** за весь набор, с референсом первой картинки;
- совсем дёшево — **FLUX.1 schnell** (~$0.03 за все 6), но придётся перегенерировать брак;
- если планируете регулярный контент (обложки видео, соцсети) — **Midjourney $10/мес** окупается гибкостью и `--sref`.

Промпты и `STYLE BLOCK` одинаково работают во всех перечисленных сервисах.

---

## 6. Постобработка

```bash
# 1. Сгенерированные файлы — в assets-src/services/
#    rent.jpg, sell.jpg, inspection.jpg, truck.jpg, import.jpg, service.jpg
# 2. Сборка WebP + иконки + OG + заглушка
npm run images:build

# 3. Если у картинок watermark внизу (Pollinations) — срезать 9%:
node scripts/images-build.mjs --crop-bottom=9

# 4. Сразу собрать и прописать пути в БД (services.photo):
node scripts/images-build.mjs --apply --crop-bottom=9

# 5. Перезапустить dev-сервер и проверить /services
```

Скрипт печатает размер каждого файла и предупреждает, если WebP получился больше 300 КБ.

Своя OG-картинка:

```bash
node scripts/images-build.mjs --og=path/to/og.png
```

---

## 7. Чек-лист приёмки одной обложки

- [ ] 16:9, горизонтальная, объект не обрезан
- [ ] тёмный фон, красный акцент **один**, без «новогодней гирлянды»
- [ ] левая треть спокойная — заголовок читается
- [ ] нет текста, watermark, логотипов и номеров
- [ ] колёса/кузов без деформаций, отражения не «ломаются»
- [ ] люди без крупных лиц, без взгляда в камеру
- [ ] картинка не выглядит как 3D-рендер или сток
- [ ] после сборки: WebP ≤ 300 КБ, на `/services` нет «квадратиков»

---

## 8. Чего генерить НЕЛЬЗЯ

- **Реальные автомобили для аренды.** Клиент бронирует конкретную машину — на карточке должны быть только её настоящие фото (загрузка в `/admin/rent`, до 20 шт.). Сгенерированное авто = обман и повод для претензий.
- **Фото Виктора и партнёров.** Только реальные (для Виктора уже есть `avatar.jpg`).
- **Эмблемы и логотипы брендов, читаемые номера.** Это товарные знаки; в промпте держите запрет.
- **Стоковые фото с Unsplash/Pexels без ключа.** Официальные API требуют ключ, `source.unsplash.com` больше не работает. Если берёте CC-фото с Openverse/Wikimedia — нужна атрибуция на сайте.

Обложки услуг — декоративные: они не выдают себя за фото конкретной машины, поэтому AI здесь уместен. Но подпись «это наш автопарк» под ними делать не нужно.

---

## 9. Если делать без AI

- снять 6 кадров на телефон в тёмном гараже/на мойке при одном красном источнике света (дешёвая LED-лента) — получится аутентичнее любого генератора;
- для OG — кадр из собственного видео с сайта;
- для иконок уже готов фирменный знак «AW» (генерируется скриптом, менять не обязательно).
