# assets-src — исходники изображений

Сюда кладутся **оригиналы** сгенерированных/отснятых картинок, из которых скрипт собирает оптимизированные файлы для сайта.

```
assets-src/
  services/
    rent.jpg          → public/images/services/rent.webp
    sell.jpg          → public/images/services/sell.webp
    inspection.jpg    → public/images/services/inspection.webp
    truck.jpg
    import.jpg
    service.jpg
  og.jpg              → src/app/opengraph-image.jpg + twitter-image.jpg (1200×630)
```

Собрать всё:

```bash
npm run images:build                              # только файлы
node scripts/images-build.mjs --apply             # + прописать services.photo в БД
node scripts/images-build.mjs --crop-bottom=9     # срезать нижние 9% (watermark)
```

Полное ТЗ, промпты и подборка моделей — в `docs/IMAGE-BRIEF.md`.

Сами исходники в git не попадают (`.gitignore`), в репозиторий идут только готовые WebP/PNG/JPG.
