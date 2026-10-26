# Промпты для генерации картинок (avtoway.by)

Готовая шпаргалка: копируй промпт в `imagegen_generate_image`, меняй детали.

## Формула

```
[объект] + [место/фон] + [свет] + [ракурс/оптика] + [стиль] + [качество]
```

Пример:
```
black BMW 5 series parked at a modern self-service car wash, wet asphalt reflections,
golden hour, low angle, 35mm lens, shallow depth of field, commercial photography, high detail
```

Правила:
- Пиши по-английски — стабильнее результат.
- Не проси текст на картинке у FLUX/Imagen: буквы «плывут». Для надписей — `ideogram-3` или `gpt-image-1`, а лучше накладывай текст в вёрстке.
- Для сайта не делай «открытку»: оставляй воздух под заголовок (пустая зона сверху/слева).
- Один и тот же `seed` + одинаковый стилевой хвост = серия похожих картинок.

Стилевые хвосты (добавляй в конец):
- фото: `commercial photography, natural light, high detail, 35mm`
- авто-премиум: `automotive advertising photography, cinematic lighting, reflective paint, ultra detailed`
- чистый сайт: `minimal composition, soft shadows, neutral background, copy space`
- интерьер: `architectural photography, wide angle, warm ambient light, clean`

Негатив (для моделей с поддержкой или как `negative_prompt`):
`text, watermark, logo, distorted wheels, extra fingers, blurry, low quality, cartoon`

## Фирменный стиль AVTOWAY (под текущий дизайн сайта)

Дизайн сайта: тёмный фон `zinc-950`, красный акцент `#ef4444`, кинематографичный свет, глянцевые отражения, без текста.

Добавляй этот хвост к промптам для карточек услуг и баннеров:

```
dark studio background, cinematic rim light, red accent glow, glossy paint reflections,
premium automotive advertising photography, ultra detailed, no text, no watermark
```

Пример (карточка аренды под сайт):

```
black premium sedan in a dark studio, cinematic rim light, red accent glow on the floor,
glossy paint reflections, low angle, premium automotive advertising photography,
high detail, no text, copy space at the top
```
`model=flux-1.1-pro`, `aspect=16:9`, `count=3`

Для единообразия серии: один `seed` на все 6 услуг + одинаковый хвост, меняй только объект
(`rent` — седан, `sell` — ключи/документы, `inspection` — диагностика, `truck` — грузовик,
`import` — контейнер/порт, `service` — сервис).

## 1. Главный баннер — аренда авто

```
professional photo of a clean black BMW 5 series parked on a city street in Minsk,
modern architecture background, golden hour, low angle, 35mm lens, shallow depth of field,
commercial automotive photography, high detail, copy space on the left
```
`model=flux-1.1-pro`, `aspect=21:9`, `count=3`

## 2. Баннер «Аренда без залога»

```
silver SUV driving on a highway at sunset, motion blur on the road, warm light,
cinematic automotive photography, wider shot, space for headline at the top
```
`model=flux-1.1-ultra`, `aspect=16:9`

## 3. Автомойка

```
modern self-service car wash at night, neon reflections on wet asphalt, one car being washed,
steam and water spray, cinematic lighting, commercial photography, high detail
```
`model=flux-1.1-pro`, `aspect=16:9`

## 4. Детейлинг / полировка

```
close-up of a detailer polishing the hood of a black car, microfiber cloth, studio light,
reflections on glossy paint, shallow depth of field, professional detailing photography
```
`model=flux-1.1-pro`, `aspect=4:3`, `count=2`

## 5. Карточка услуги (нейтральный фон)

```
a modern car interior being cleaned, soft studio light, neutral gray background,
minimal composition, professional service photography, copy space on the right
```
`model=imagen-4`, `aspect=4:3`

## 6. Иконки услуг (набор)

```
set of four minimal flat icons: car wash, polishing, interior cleaning, tire service,
consistent line style, blue and white palette, white background, vector look
```
`model=recraft-v3`, `aspect=1:1`, `count=4`

## 7. Логотип / вывеска

```
minimal logo for a car detailing center, geometric mark, dark blue and silver,
clean typography "AVTOWAY", white background, professional brand identity
```
`model=ideogram-3`, `aspect=1:1`, `count=4`

## 8. Команда / доверие

```
friendly car service employee in uniform handing keys to a client, bright modern workshop,
natural light, documentary style, 50mm, realistic, warm atmosphere
```
`model=flux-1.1-pro`, `aspect=4:3`

## 9. Партнёрам / B2B

```
row of premium rental cars in a clean parking lot, morning light, symmetrical composition,
fleet photography, commercial style, high detail
```
`model=flux-1.1-ultra`, `aspect=16:9`

## 10. Мобильный блок / сторис

```
black sedan on a wet road at dusk, headlights on, reflections, vertical composition,
cinematic, space for text at the bottom
```
`model=flux-1.1-pro`, `aspect=9:16`

## 11. Черновик композиции (дёшево)

```
professional photo of a car at a car wash, golden hour, wide shot
```
`model=flux-schnell`, `aspect=16:9`, `count=4` → выбери лучший кадр → повтори на `flux-1.1-pro` с тем же `seed`.

## 12. Правка готовой картинки

```
replace the background with a modern car wash at night, keep the car and its reflections,
cinematic neon lighting
```
`imagegen_edit_image`, `image_path=public/images/generated/...webp`, `model=gpt-image-1`

## Чек-лист перед публикацией

- [ ] нет текста/логотипов, которые «поплыли»
- [ ] колёса, фары, номера выглядят нормально (у FLUX иногда искажаются диски)
- [ ] есть место под заголовок, картинку не жалко обрезать на мобильном
- [ ] скачался webp и адаптивные `@1024` / `@640` (проверь `imagegen_list_generated`)
- [ ] в `next/image` указаны `width`, `height`, `sizes` и `alt`
- [ ] модель для финала — `flux-1.1-pro` / `imagen-4`, не `schnell`

## Порядок работы (экономно)

1. `flux-schnell` — 4–8 быстрых вариантов композиции (~$0.003/шт).
2. Выбрал кадр и `seed` → `flux-1.1-pro` с тем же промптом и seed.
3. Нужен максимум/печать → `flux-1.1-ultra`.
4. Нужна правка фона → `edit_image` (gpt-image-1).
5. Сохраняй в `folder=cars` / `hero` / `services`, чтобы не терять файлы.
