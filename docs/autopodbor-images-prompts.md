# Промпты изображений для лендинга «Автоподбор»

> Дата: 27.10.2026
> Назначение: 13 изображений для `/services/inspection` в едином стиле АВТОWAY.
> Статус: **генерация не выполнялась**. MCP `imagegen` отключён в `opencode.json` (`"disabled": true`), а в `mcp/imagegen/.env` нет API-ключей. Ниже — готовые промпты, которые нужно прогнать через MCP после добавления ключей.
> Все промпты — на английском: так модели стабильнее понимают композицию и свет. Текст на сайте — только HTML, не на картинке.

---

## 1. Единый стиль

### 1.1. STYLE BLOCK (добавлять в конец каждого промпта)

```
cinematic automotive editorial photography, dark moody atmosphere, deep blacks and charcoal greys, single crimson red accent light (#ef4444), wet reflective concrete, volumetric haze, shallow depth of field, 35mm full-frame look, subtle film grain, high dynamic range but not HDR, professional advertising campaign, wide 16:9 composition, main subject right of centre, clean dark negative space on the left, photorealistic, no text, no letters, no watermark, no logos, no brand emblems, no readable license plates, no distorted wheels, no extra parts
```

### 1.2. Негативный промпт (если поле есть)

```
text, letters, words, watermark, logo, brand emblem, license plate, numbers, deformed car, extra wheels, distorted proportions, cartoon, 3d render, illustration, oversaturated, hdr artifacts, cluttered background, low quality, jpeg artifacts, people looking at camera, close-up faces, bright daylight, white background, cheap stock photo, floating objects, broken reflections
```

### 1.3. Общие правила

- Один источник красного света. Не «новогодняя гирлянда».
- Левая треть — спокойная тёмная зона: туда ляжет заголовок/текст.
- Главный объект — правее центра.
- Люди — со спины, в расфокусе, без крупных лиц. Нельзя выдавать AI-человека за Виктора или реального клиента.
- Автомобили — обезличенные, без эмблем и номеров. Не показывать конкретную модель там, где это может ввести в заблуждение.
- Кейсы, отчёты и фото клиентов — **только реальные**. AI-картинки — декоративные обложки, не доказательство работы.
- Соотношение сторон: 16:9 для hero/карточек, 4:5 для портрета, 1200×630 для OG.
- Разрешение: 2K по длинной стороне (2048 px) или больше.
- Seed: один на всю серию, чтобы свет и цвет совпадали.
- Референс: первую удачную картинку передавать как style reference для остальных.

---

## 2. Список файлов

| # | Файл | Где используется | Размер | Обязательно |
|---|---|---|---|---|
| 1 | `public/images/generated/autopodbor-hero.webp` | Hero | 1920×1080 | да |
| 2 | `autopodbor-single-check.webp` | Тариф «Разовый осмотр» | 1600×900 | да |
| 3 | `autopodbor-day-expert.webp` | Тариф «Эксперт на день» | 1600×900 | да |
| 4 | `autopodbor-turnkey.webp` | Тариф «Под ключ» | 1600×900 | да |
| 5 | `autopodbor-europe.webp` | Тариф «Из Европы» | 1600×900 | да |
| 6 | `autopodbor-report.webp` | Блок «Пример отчёта» | 1600×900 | да |
| 7 | `autopodbor-thickness.webp` | Блок проверок | 1200×800 | желательно |
| 8 | `autopodbor-diagnostics.webp` | Блок проверок | 1200×800 | желательно |
| 9 | `autopodbor-lift.webp` | Блок проверок | 1200×800 | желательно |
| 10 | `autopodbor-legal.webp` | Блок гарантий | 1200×800 | желательно |
| 11 | `autopodbor-expert.webp` | Блок эксперта (только как анонимный фон, не портрет Виктора) | 1200×1500 | опционально |
| 12 | `autopodbor-cta.webp` | Финальный CTA | 1920×1080 | да |
| 13 | `autopodbor-og.webp` | OG/Twitter | 1200×630 | да |

---

## 3. Промпты

### 3.1. Hero — `autopodbor-hero.webp`

**Смысл:** эксперт проверяет автомобиль, а не «продаёт мечту». Доверие, профессионализм, тёмный гараж.

**Композиция:** эксперт справа, автомобиль в три четверти, левая треть — тёмная и пустая. Красный контровой свет по кузову.

```
A professional automotive inspector in a dark underground garage, wearing a black technical jacket and nitrile gloves, holding a tablet and a paint thickness gauge, standing beside a modern dark grey sedan with the hood open; red rim light traces the car's body line; a rolling tool cart with a diagnostic scanner and a flashlight; wet concrete floor with soft reflections; volumetric haze; inspector seen from three-quarter back, face not visible; calm, trustworthy, expert mood; left third of the frame is dark and uncluttered for a headline
```

**Alt:** `Эксперт АВТОWAY проверяет автомобиль в тёмном гараже`
**Overlay:** слева — бейдж, H1, подзаголовок, CTA. Не размещать текст поверх лица/рук.

---

### 3.2. Разовый осмотр — `autopodbor-single-check.webp`

**Смысл:** точечная проверка одного авто, толщиномер, внимательность к деталям.

```
Close-up of a gloved hand pressing a digital paint thickness gauge against the rear door of a dark grey car, red LED glow from the device, fine water droplets on the paint, dark garage background with soft red rim light, shallow depth of field, precise and technical mood
```

**Alt:** `Замер толщины лакокрасочного покрытия толщиномером`
**Overlay:** нижняя треть — плашка с названием тарифа и ценой.

---

### 3.3. Эксперт на день — `autopodbor-day-expert.webp`

**Смысл:** несколько автомобилей за один день, сравнение, маршрут.

```
Two modern cars parked nose-to-nose in a dim city lot at dusk, an automotive inspector with a clipboard and a tablet walking between them, red taillights glowing, wet asphalt with reflections, blurred city lights in the background, sense of comparing several options in one day, inspector seen from behind, face not visible
```

**Alt:** `Эксперт сравнивает несколько автомобилей за один день`
**Overlay:** верхняя часть — заголовок; нижняя — цена и CTA.

---

### 3.4. Подбор «под ключ» — `autopodbor-turnkey.webp`

**Смысл:** передача ключей, финал процесса, уверенность.

```
Close-up of a hand passing a car key fob to another hand in the foreground, a modern dark car softly blurred in a dark showroom behind, a leather folder with documents under the arm, red rim light on the key and the car body, glossy floor reflections, shallow depth of field, premium but restrained mood, no faces
```

**Alt:** `Передача ключей от проверенного автомобиля`
**Overlay:** плашка «Чаще всего выбирают» и цена — в HTML, не на картинке.

---

### 3.5. Из Европы — `autopodbor-europe.webp`

**Смысл:** дорога, автовоз, Европа, длинный путь.

```
A car transporter truck fully loaded with modern cars driving on a European highway at dusk, motion blur on the road, red taillights and headlights, moody overcast sky, wet asphalt, sense of a long journey and logistics, cinematic wide shot, no logos or license plates
```

**Alt:** `Автовоз с автомобилями на европейской трассе`
**Overlay:** нижняя треть — цена «от» и кнопка.

---

### 3.6. Пример отчёта — `autopodbor-report.webp`

**Смысл:** цифровой отчёт, фото, диагностика, вердикт. Без читаемого текста — только структура.

```
Overhead flat-lay of a dark desk: a tablet displaying an abstract inspection report interface with photo thumbnails and rating bars (no readable text), printed photo sheets, a paint thickness gauge, a diagnostic scanner, car keys and a black coffee cup; red desk lamp glow from the right; matte black surface; organized, professional, editorial mood
```

**Alt:** `Пример отчёта об осмотре автомобиля: фото, диагностика и заключение`
**Overlay:** рядом — HTML-карточка с оценками и вердиктом. Не пытаться нарисовать текст на экране.

---

### 3.7. Толщиномер — `autopodbor-thickness.webp`

**Смысл:** «видим то, что скрыто»: микро-проверка ЛКП.

```
Extreme macro of a digital paint thickness gauge on a car fender, red digital glow, tiny water droplets and dust on the paint, dark garage background with a single red rim light, shallow depth of field, technical and precise, no text on the device
```

**Alt:** `Проверка толщины краски на кузове автомобиля`
**Overlay:** иконка + короткая подпись в HTML.

---

### 3.8. Компьютерная диагностика — `autopodbor-diagnostics.webp`

**Смысл:** сканер, ошибки, параметры, электроника.

```
Interior of a modern car at night, an OBD diagnostic cable plugged under the dashboard, a laptop on the passenger seat displaying abstract graphs and error codes (no readable text), red ambient light from the dashboard, shallow depth of field, dark and technical mood
```

**Alt:** `Компьютерная диагностика автомобиля через OBD-сканер`
**Overlay:** подпись «Сканируем все блоки» в HTML.

---

### 3.9. Подъёмник — `autopodbor-lift.webp`

**Смысл:** ходовая, днище, подъёмник, честный осмотр снизу.

```
A modern car raised on a two-post lift in a dark clean workshop, a mechanic seen from behind inspecting the underbody with a work lamp, red tool cabinet in the background, wet floor reflections, volumetric haze, professional and trustworthy mood, no faces
```

**Alt:** `Осмотр автомобиля на подъёмнике в автосервисе`
**Overlay:** подпись «Ходовая и днище — на подъёмнике».

---

### 3.10. Юридическая проверка — `autopodbor-legal.webp`

**Смысл:** документы, VIN, залоги, ограничения.

```
Close-up of gloved hands comparing a vehicle registration document with a VIN plate on a car door frame, a smartphone with an abstract database screen nearby, red light accent, dark garage background, shallow depth of field, serious and precise mood, no readable text or numbers
```

**Alt:** `Проверка документов и VIN-номера перед покупкой`
**Overlay:** подпись «Залоги, розыск, ограничения — до сделки».

---

### 3.11. Эксперт — `autopodbor-expert.webp` (опционально)

**Важно:** **не использовать как фото Виктора или реального сотрудника.** Только как анонимный фон/иллюстрация. Если есть реальное фото — использовать его, а этот файл не публиковать.

```
Editorial portrait of an anonymous male automotive expert in his mid-30s, black technical jacket, standing in a dark garage with a blurred car silhouette behind, red rim light on the shoulder and jaw, calm confident expression, looking slightly off-camera, dark background with negative space on the left, cinematic lighting, photorealistic
```

**Alt:** `Автоэксперт в тёмном гараже`
**Overlay:** имя, цитата и факты — только HTML.

---

### 3.12. Финальный CTA — `autopodbor-cta.webp`

**Смысл:** «следующий шаг» — ночная дорога, автомобиль, ощущение движения.

```
Rear three-quarter view of a modern car on a wet night road, red taillight trail, city lights bokeh in the background, large dark empty space on the left for a headline and form, cinematic wide composition, subtle rain, reflective asphalt, no logos or license plates
```

**Alt:** `Автомобиль на ночной дороге`
**Overlay:** заголовок, форма, контакты.

---

### 3.13. OG-изображение — `autopodbor-og.webp`

**Смысл:** превью ссылки в Telegram/соцсетях. Крупно, контрастно, с местом под логотип.

```
Wide cinematic banner of a dark automotive inspection scene: silhouette of a modern car with a red rim light on the right, an inspector with a tablet in the background, wet concrete floor, subtle haze, large clean dark space on the left for a logo and headline, premium brand mood, 1200x630 composition
```

**Alt:** `Автоподбор АВТОWAY — проверка авто перед покупкой`
**Текст:** добавлять в HTML/графическом редакторе, не просить модель писать по-русски.

---

## 4. Настройки генерации

| Параметр | Значение |
|---|---|
| Модель (черновик) | FLUX.1 schnell / Z-Image Turbo |
| Модель (финал) | FLUX 1.1 Pro / Imagen 4 / Nano Banana 2 |
| Соотношение | 16:9 (hero, карточки, CTA), 4:5 (эксперт), 1200×630 (OG) |
| Разрешение | 2K по длинной стороне |
| Seed | один на серию |
| Style reference | первая удачная картинка |
| Количество вариантов | 2–4 на изображение |
| Постобработка | WebP, ≤ 300 КБ, лёгкий контраст, без oversaturation |

### Команды MCP (когда появятся ключи)

1. `list_models` — проверить доступные модели.
2. `recommend_model` — для черновика/финала.
3. `generate_image` — передать промпт + STYLE BLOCK + негатив, размер, seed.
4. `list_generated` — проверить файлы в `public/images/generated/`.
5. `check_setup` — если модель/ключ не работает.

Точные имена инструментов зависят от версии MCP-сервера. Если инструмент недоступен — сгенерировать вручную в любом сервисе по этим промптам и положить файлы в `public/images/generated/`.

---

## 5. Постобработка и интеграция

1. Сгенерированные файлы — в `public/images/generated/`.
2. Проверить: 16:9, нет текста/логотипов/номеров, левая треть пустая, колёса не деформированы.
3. Конвертировать в WebP ≤ 300 КБ:
   ```bash
   node -e "const sharp=require('sharp'); sharp('input.png').webp({quality:86}).toFile('public/images/generated/autopodbor-hero.webp')"
   ```
   ( `sharp` уже используется в `scripts/images-build.mjs`.)
4. Прописать пути в админке (`AutoPodborGalleryItem.photo`) или в настройках hero.
5. Для каждой картинки заполнить `alt` (русский, осмысленный).
6. Проверить на мобильном: hero не должен «съедать» весь экран; LCP < 2.5s.
7. Не публиковать AI-изображение как «фото нашего клиента/авто».

---

## 6. Чек-лист приёмки

- [ ] 13 файлов на месте, имена совпадают.
- [ ] Все 16:9 (кроме портрета и OG), объект не обрезан.
- [ ] Тёмный фон, один красный акцент.
- [ ] Левая треть спокойная — текст читается.
- [ ] Нет текста, watermark, логотипов, номеров.
- [ ] Колёса/кузов не деформированы, отражения не «ломаются».
- [ ] Люди без крупных лиц и взгляда в камеру.
- [ ] Не выглядит как 3D-рендер или дешёвый сток.
- [ ] WebP ≤ 300 КБ, нет «квадратиков».
- [ ] `alt` заполнен, изображение не выдаёт себя за реальное фото.
- [ ] Hero и OG проверены в Telegram-превью.

---

## 7. Если генерация недоступна

Этот файл уже содержит всё необходимое, чтобы сгенерировать изображения позже:

1. Добавить ключи в `mcp/imagegen/.env` (см. `.env.example`).
2. Включить MCP в `opencode.json` (`"disabled": false`).
3. Перезапустить сессию/OpenCode, чтобы инструменты `imagegen_*` появились.
4. Прогнать промпты по одному, начиная с hero.
5. Или отдать промпты дизайнеру/в Midjourney/Flux/Imagen — стиль и композиция описаны достаточно подробно.

**Не заменяйте реальные фото кейсов и отчётов AI-картинками.** Лендинг может временно работать без декоративных изображений (тёмные градиенты + типографика), но без реальных доказательств он будет слабее.
