# Тестирование

## Пирамида

| Уровень | Инструмент | Где лежит | Что проверяет |
|---|---|---|---|
| Unit | Vitest | `tests/*.test.ts`, `src/**/*.test.ts` | Чистая логика: цены, токены, slug, телефон, калькулятор, magic bytes, раскладка карусели |
| E2E | Playwright | `tests/e2e/*.spec.ts` | Формы, 404, защита админки, security.txt, калькулятор, отчёт, адаптивность |

Текущее состояние: **103 unit-теста**, **16 E2E-тестов**. Покрытие ключевой логики — **95% строк** (auth-token, price, slug, rate-limiter, image-type, customs, carousel-layout, admin-host). UI покрывается E2E, а не unit-тестами.

## Команды

```bash
npm test                 # unit, один прогон
npm run test:watch       # unit в watch-режиме
npm run test:coverage    # покрытие (text + html в coverage/)
npm run test:e2e         # E2E, нужен запущенный сайт
```

E2E по умолчанию идёт на `http://localhost:3000`. Если сайт на другом порту:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3001"
npm run test:e2e
```

Тестовые заявки удаляются автоматически в `afterAll`.

## Правила

1. Новую бизнес-логику покрываем unit-тестом рядом с модулем или в `tests/`.
2. Новую публичную форму — E2E-тестом с очисткой данных.
3. Тесты не должны зависеть от рабочей базы `data/avtoway.db`.
4. Для UI-проверок используем роли и плейсхолдеры, а не CSS-классы.
5. Перед коммитом: `lint`, `typecheck`, `test`, `build`.

## CI

GitHub Actions выполняет `npm ci`, `lint`, `typecheck`, `test`, `build` на каждый push в `dev`.
