# Архитектура АВТОWAY

## Концепция

Блогер + экосистема услуг вокруг автомобилей.  
Главная — продаёт личный бренд. Каждая услуга — мини-продукт со своей страницей, БД, ролями.

---

## Общая структура проекта

```
АВТОWAY
├── Ядро (блог, личный бренд)
│   ├── Главная (hero + about + youtube section)
│   ├── About
│   ├── YouTube-канал (интеграция)
│   └── Видео на сайте
│
├── Услуги (каждая — мини-продукт)
│   ├── Аренда
│   │   ├── Машины (каталог, фото, статусы)
│   │   ├── Клиенты (арендаторы)
│   │   ├── Контракты (сроки, цена, условия)
│   │   └── Подкаты (отдельный тип или пометка)
│   │
│   ├── Продажа авто
│   │   ├── Объявления (марка, модель, фото, цена)
│   │   ├── Чек-лист осмотра (кузов, двигатель, ходовая, салон)
│   │   ├── Шкала состояния (🟢🟡🟠🔴)
│   │   ├── Цена: своя + средняя по av.by
│   │   └── Продавец (данные, контакты)
│   │
│   ├── Автоподбор
│   │   ├── Тарифы (разовая проверка / эксперт на день / под ключ)
│   │   ├── Заявки от клиентов
│   │   ├── Отчёты осмотра (PDF)
│   │   └── Telegram-чат с логом в БД
│   │
│   ├── Эвакуатор
│   │   ├── Страница-визитка (фото, контакты)
│   │   ├── Заказы (кто, когда, откуда, куда)
│   │   └── Водители (когда > 1 авто)
│   │
│   ├── Автопригон
│   │   ├── Информационная страница
│   │   ├── Калькулятор стоимости (цена + доставка + растаможка)
│   │   └── Заявки (марка, модель, бюджет, сроки)
│   │
│   └── Автосервис
│       └── (дальний план, страница-заглушка)
│
├── Сквозное
│   ├── Клиенты (общая база, ссылаются все модули)
│   ├── Отзывы (под каждую услугу + главная, с фото, из соцсетей)
│   ├── Медиа (фото/видео, S3 или локально)
│   ├── Соцсети (TG, IG, VK, YT, Rutube — статус интеграций)
│   └── Карты (Яндекс.Карты, точки на карте)
│
└── Админка
    ├── Dashboard
    ├── Сотрудники + роли + профиль
    ├── Управление каждой услугой (CRUD)
    ├── Клиенты
    ├── Отзывы
    ├── Соцсети (статус, посты)
    └── Настройки
```

---

## Таблицы БД (по модулям)

### Ядро (реализовано)
| Таблица | Назначение |
|---------|-----------|
| users | Учётка: login, email, password |
| profiles | Анкета: ФИО, телефон, должность, дата рождения, адрес, образование, график работы |
| roles | Роли: Администратор, Редактор, Наблюдатель |
| role_permissions | Права: users.manage, services.manage, audit.view... |
| user_roles | Связь многие-ко-многим |
| audit_logs | Логи действий |

### Аренда (следующий модуль)
| Таблица | Назначение |
|---------|-----------|
| cars | id, brand, model, year, vin, color, fuel_type, transmission, seats, price_per_day, deposit, photos (JSON), status (free/rented/maintenance), notes |
| подкаты | В той же таблице cars с пометкой is_low_loader |
| rental_clients | id, name, phone, passport_data, driver_license, notes |
| rental_contracts | id, car_id FK, client_id FK, start_date, end_date, total_price, deposit_paid, status (active/closed/cancelled), notes |

### Продажа авто
| Таблица | Назначение |
|---------|-----------|
| listings | id, brand, model, year, mileage, price, condition_score, market_price_avg, photos, video_url, description, seller_name, seller_phone, status (draft/active/sold/archived) |
| inspection_checklists | id, listing_id FK, sections JSON [{name: "кузов", score, notes}, ...], overall_score, inspector_name, created_at |

### Автоподбор
| Таблица | Назначение |
|---------|-----------|
| selection_packages | id, name, price, description, services (JSON) |
| selection_orders | id, client_id FK, package_id FK, car_brand, car_model, budget, status (new/in_progress/done/cancelled), telegram_chat_id |
| inspection_reports | id, order_id FK, report_data JSON, pdf_path, created_at |

### Эвакуатор
| Таблица | Назначение |
|---------|-----------|
| tow_orders | id, client_name, client_phone, from_address, to_address, car_info, status (new/accepted/done/cancelled), price, driver_id FK |
| tow_drivers | id, name, phone, car_model, photo, is_active |

### Автопригон
| Таблица | Назначение |
|---------|-----------|
| import_requests | id, client_name, phone, car_brand, car_model, budget, country, status, created_at |

### Сквозное
| Таблица | Назначение |
|---------|-----------|
| clients | id, name, phone, email, telegram, source (услуга, откуда пришёл), notes |
| reviews | id, client_id FK, service_slug, rating, text, photos JSON, source (сайт/tg/ig), is_published, created_at |
| media | id, path, alt, type (image/video), service_slug, entity_id (полиморфная связь) |

---

## Админка — страницы

| Раздел | Страница | Права |
|--------|----------|-------|
| Dashboard | /admin | Все |
| Мой профиль | /admin/profile | Все |
| Сотрудники | /admin/users | users.manage |
| Роли | /admin/roles | users.roles |
| Услуги | /admin/services | services.manage |
| Партнёры | /admin/partners | partners.manage |
| Аудит | /admin/audit-logs | audit.view |
| Аренда | /admin/rent | rent.manage (новая роль) |
| Продажа | /admin/sell | sell.manage |
| Автоподбор | /admin/selection | selection.manage |
| Эвакуатор | /admin/truck | truck.manage |
| Автопригон | /admin/import | import.manage |
| Клиенты | /admin/clients | clients.view |
| Отзывы | /admin/reviews | reviews.manage |
| Интеграции | /admin/integrations | admin |

---

## Очерёдность реализации

```
1. ✅ Админка (сотрудники, роли, профиль, аудит)
2. ✅ Услуги (конфиг + админка с вкл/выкл)
3. 🟡 Страницы услуг (рендер из конфига)
4. 🔴 Аренда авто (модуль: БД + админка + фронт)
5. 🟡 Продажа авто (объявления + чек-листы)
6. 🟡 Автоподбор (тарифы + заявки)
7. 🟠 Клиенты (общая база)
8. 🟠 Отзывы
9. 🟠 Медиа (файловое хранилище)
10. 🟠 Интеграции (соцсети, карты, av.by)
11. 🟠 Чат с клиентом (TG)
12. 🟠 Эвакуатор
13. 🟠 Автопригон
14. 🔵 Автосервис (дальний план)
15. 🔵 Subdomains (rent.avtoway.by etc.)
16. 🔵 Мобильное приложение
```

---

## Текущие услуги в конфиге

| slug | Название | Статус |
|------|----------|--------|
| rent | Аренда авто | ✅ Активна |
| sell | Продажа авто | ✅ Активна |
| inspection | Автоподбор | ✅ Активна |
| truck | Эвакуатор | ❌ Неактивна |
| import | Автопригон | ❌ Неактивна |
| service | Автосервис | ❌ Неактивна |
