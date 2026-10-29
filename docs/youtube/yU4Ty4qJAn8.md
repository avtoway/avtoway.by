# Превью для Shorts `yU4Ty4qJAn8`

- **Ролик:** «Удаляю ржачину с днища авто #diy #автоway #кузовнойремонт #эксперимент»
- **Канал:** АВТОWAY (@AVTOWAY)
- **Ссылка:** https://youtube.com/shorts/yU4Ty4qJAn8
- **Длительность:** 34 с, вертикаль 9:16
- **Разбор сделан по реальным кадрам** (раскадровка YouTube + постер 1280×720), не по описанию.

## 1. Что в ролике

Мужик в чёрной толстовке лезет под машину в гараже и показывает ржавчину на днище. Свет — холодная синяя LED-лампа + фонарик телефона, фон — кирпичная стена, бетонный пол, шланги, баллон с аэрозолью. Дальше зачищает порог/лонжерон, наносит состав, в конце показывает обработанный участок — остаётся ржавое пятно, то есть «процесс, а не финал». Тон — бытовой, «смотрите что тут», без пафоса.

**Раскадровка (по кадрам):**

| Таймкод | Что в кадре | План | Текст на экране |
|---|---|---|---|
| 0–3 с | Мужик лежит под машиной, смотрит в камеру | средний, снизу | «Лезем» |
| 4–8 с | Показывает ржавый участок фонариком | крупный | «Смотри» |
| 9–14 с | Тычет пальцем в ржавчину, сыпется | макро | «Буду» |
| 15–22 с | Зачистка инструментом, искры/пыль | крупный | «попробуем» |
| 23–28 с | Наносит состав, металл мокрый | крупный | «наноску» |
| 29–34 с | Обработанный участок + остаток ржавчины | средний | «покрас» |

**Что цепляет:** реальный гараж, а не студия; «страшная» ржавчина вблизи; крупные пальцы/инструмент в кадре; обещание процесса за 30 секунд.

## 2. Три концепции превью

**A. «БЫЛО / СТАЛО» (рекомендую).** Диагональный сплит: ржавое днище → чистый металл. Сплит читается в 320 px, не требует лица, честно отражает содержание.

**B. «Реакция под машиной».** Лицо в кадре снизу, фонарик бьёт в ржавую дыру, эмоция «вы это видели?». Даёт CTR за счёт лица и света, но нужен хороший кадр или генерация.

**C. «Палец сквозь дыру».** Макро, палец проходит через ржавчину, летят хлопья. Самый «шоковый» вариант, но легко скатиться в кликбейт — ролик показывает именно такую картину, так что граница честная.

## 3. Промты

Общее: 16:9 = 1280×720 (минимум), 9:16 = 720×1280 для ленты Shorts. Текст на картинке не рисуем — верстаем поверх в HTML/редакторе.

### A. Сплит «было/стало»

```text
split composition of a car underbody in a garage, left side heavily rusted flaking steel
with orange-brown corrosion and small holes, right side the same beam after cleaning,
bare shiny metal with wet grey rust converter, a black-gloved hand in a nitrile glove
pointing at the boundary between rust and clean metal, tools and a spray can blurred on the
concrete floor, brick wall in the background, cold blue LED work lamp from the left,
warm orange bounce light on the rust, high contrast, dramatic side lighting, 35mm lens,
shallow depth of field, photorealistic, ultra detailed, gritty DIY workshop mood
```

**Negative:** `text, watermark, logo, extra fingers, deformed hands, broken car panels, blurry, low quality, cartoon, CGI render look, oversaturated skin, messy background clutter`

**9:16 версия:** то же самое, заменить первую строку на `vertical split composition of a car underbody, top half rusted, bottom half cleaned`, добавить `tight vertical framing, safe margins at top and bottom`.

### B. Реакция под машиной

```text
young male mechanic in a black hoodie lying under a car, holding a phone flashlight up at a
rusted hole in the floor pan, shocked wide-eyed expression, rust flakes and dust floating in
the light beam, cold blue LED garage light mixed with warm orange glow from the rust, brick
wall and concrete floor, low angle tight shot on the face, shallow depth of field,
cinematic photorealistic, ultra detailed, documentary DIY vibe
```

**Negative:** `text, watermark, logo, distorted face, extra fingers, deformed hands, plastic skin, blurry, low quality, cartoon`

### C. Палец сквозь дыру

```text
extreme close up of a hand in a black nitrile glove pushing a finger through a rusted hole
in a car floor pan, crumbling orange rust flakes falling, torch light raking across pitted
metal, dark garage background out of focus, macro detail, hard side light, photorealistic,
cinematic, gritty
```

**Negative:** `text, watermark, logo, extra fingers, deformed hand, fake rust texture, blurry, low quality, cartoon`

### Параметры генерации

| | |
|---|---|
| aspect | 16:9 основное, 9:16 для ленты Shorts |
| seed | фиксировать после удачного кадра, чтобы крутить вариации |
| count | 4–6 на концепцию, отбирать по читаемости в 320 px |
| постобработка | +10–15 контраста, лёгкий vignette, резкость по центру |

## 4. Текст поверх

5–6 слов максимум, крупный жирный шрифт, белый + акцент, обводка/тень. Свободную зону оставлять в верхней трети (в ленте Shorts низ перекрывается UI).

- `ЭТО ЕЩЁ ХОДИТ?`
- `РЖАВЧИНА. БЫЛО → СТАЛО`
- `ДНИЩЕ ГНИЁТ`
- `УБРАЛ ЗА 30 СЕКУНД`

## 5. Палитра

| Роль | HEX |
|---|---|
| Фон / тень | `#09090B` |
| Холодный свет цеха | `#1E3A5F` / `#38BDF8` |
| Ржавчина | `#B45309` / `#C2410C` |
| Акцент бренда | `#EF4444` |
| Текст | `#FAFAFA` |

## 6. Какую модель брать

| Этап | Модель | Почему |
|---|---|---|
| Черновики, перебор композиций | `pollinations-flux` (бесплатно, без ключа) | Быстро, хватает чтобы поймать раскладку. Без ключа сейчас отдаёт 402 после первого запроса |
| Черновики с ключом fal | `flux-schnell` | Дёшево, 4 варианта за копейки |
| **Финал, фотореализм** | **`flux-1.1-pro`** (fal) | Лучший баланс текстуры металла и света |
| Финал, если нужен «дорогой» кадр | `imagen-4-ultra` | Чище по физике света, хорошо с металлом |
| Текст прямо на картинке (не рекомендую) | `ideogram-3` / `gpt-image-1` | Только если лень верстать; кириллица всё равно надёжнее в HTML |

Порядок работы: `flux-schnell` → выбрать 1–2 кадра → `flux-1.1-pro` с тем же seed → текст поверх в HTML.

## 7. Что осталось

- Ключ `GOOGLE_API_KEY` (https://aistudio.google.com/apikey) — тогда `npm run yt:analyze -- "https://youtube.com/shorts/yU4Ty4qJAn8"` прогонит ролик целиком и уточнит раскадровку по звуку и таймкодам.
- Ключ `FAL_KEY` или `GOOGLE_API_KEY` для финальной генерации в `public/images/generated/`.
