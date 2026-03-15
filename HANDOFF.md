# Bullet Journal — Handoff

**Обновлено:** 2026-03-10
**Статус:** MVP-1 завершён (кроме стикеров). Собираем feedback от Кати.

---

## Что готово

### MVP-0
- Главная: 12 cottagecore-обложек, streak с milestone-бейджами (7/30/100/365), синк/бэкап кнопки
- Смена обложки месяца: кнопка на карточке → выбор из 12 вариантов
- Календарь: месячная сетка, mood-цвета, фоновая обложка, навигация между месяцами
- Mood tracker: 5 категорий (Плохо/Тревожно/Грустно/Спокойно/Счастливый день)
- Year in Pixels: годовая мозаика настроений
- Задачи: список на месяц, привязка к дате, навигация ← → по месяцам, CRUD
- Migration: панель переноса незакрытых задач (показывается только когда предыдущий месяц уже прошёл)
- События: привязаны к дню, время + цветовая метка
- Трекер косметики: добавление + удаление + сканер штрихкода (html5-qrcode + Open Beauty Facts API), PAO, 12 типов
- Streak: счётчик дней подряд + milestone-бейджи
- Cloud sync: n8n webhook + staticData, auto-sync при каждом изменении (debounce 3с)
- JSON-экспорт (бэкап) + восстановление из облака
- PWA-иконки + apple-touch-icon, работает offline

### MVP-1
- Day Journal: текстовые заметки к каждому дню (между mood и событиями)
- Habit Tracker: решётка привычек по месяцам (строки — привычки, столбцы — дни 1-31)
- Future Log: планы на 12 месяцев вперёд (начиная со следующего месяца)
- Collections: тематические страницы (Книги, Вишлист, Идеи для подарков, Brain Dump)

### Не сделано (отложено)
- Стикеры (50-100 шт, drag & drop + масштабирование) — самая сложная фича, ждём запроса от Кати

---

## Деплой

- **URL**: https://yarbalakin.github.io/bullet-journal/
- **Repo**: https://github.com/yarbalakin/bullet-journal (public)
- **GitHub Pages**: legacy mode, branch main, path /
- Push в main → автодеплой через 1-2 мин
- **Service Worker**: `CACHE_NAME = 'bujo-v14'` в sw.js — при любом обновлении JS/CSS/HTML **бампать версию** (v15, v16, ...) чтобы браузер скачал новые файлы

---

## n8n Cloud Sync

- **Workflow**: BuJo Cloud Sync (`HKWEWhNIBEwBLUdw`), ACTIVE
- **Webhook**: `https://estateinvest.app.n8n.cloud/webhook/bujo-sync`
- **Хранение**: workflow staticData (JSON.stringify всех данных)
- `POST {action: "save", data: {...}}` → сохраняет
- `POST {action: "restore"}` → возвращает данные

---

## Файловая структура

```
index.html              — SPA, подключает все скрипты
sw.js                   — Service Worker (CACHE_NAME = bujo-v14)
manifest.json           — PWA manifest
css/style.css           — все стили (~1500+ строк)
js/db.js                — IndexedDB (v4) + cloud sync + toast
js/router.js            — hash-based SPA роутер
js/app.js               — init, navigate(), SW регистрация
js/pages/home.js        — главная с обложками + streak + nav-grid
js/pages/calendar.js    — календарь + mood picker
js/pages/day.js         — вид дня (mood + заметки + события + задачи)
js/pages/tasks.js       — список задач месяца + migration panel
js/pages/cosmetics.js   — трекер косметики + barcode scanner
js/pages/pixels.js      — Year in Pixels
js/pages/future.js      — Future Log (12 месяцев вперёд)
js/pages/collections.js — Collections (тематические страницы)
js/pages/habits.js      — Habit Tracker (решётка по месяцам)
js/pages/coverPicker.js — выбор обложки месяца
images/covers/          — 12 jpg обложек (cottagecore, fal.ai Flux Pro)
assets/                 — PWA иконки (icon-192.png, icon-512.png)
```

---

## IndexedDB (DB_VERSION = 4)

| Store | keyPath | Индексы | Содержимое |
|---|---|---|---|
| `months` | `id` | — | `{id: "YYYY-MM", coverIndex: N}` |
| `tasks` | autoIncrement | `monthId`, `date` | задачи |
| `events` | autoIncrement | `date` | события |
| `moods` | `date` | — | `{date, level 1-5}` |
| `cosmetics` | autoIncrement | `expireDate` | косметика + PAO |
| `streak` | `id` | — | `{id: "main", current, longest, lastDate}` |
| `futurelog` | `id` | — | `{id: "YYYY-MM", items: [...]}` |
| `collections` | autoIncrement | — | `{title, type, items: [{text, checked}]}` |
| `habits` | `id` | — | `{id: "meta", items:[{name,color}]}` + `{id:"YYYY-MM", checks:{}}` |
| `daynotes` | `date` | — | `{date: "YYYY-MM-DD", text}` |

---

## Важные паттерны

**Роутер:**
```javascript
route('pageName', renderFunction);   // регистрация
navigate('pageName', { params });    // переход
```

**dbPut автоматически триггерит cloud sync** (debounce 3с). Не нужно вызывать sync вручную.

**Service Worker update:** бампать `CACHE_NAME` → SW удалит старый кеш при activate, браузер скачает всё заново.

**Вложенные клики (карточки):** использовать `event.stopPropagation()` на дочерних кнопках.

---

## Что дальше (v1.1)

1. **Feedback от Кати** → записать в PROJECT.md раздел 10
2. **Стикеры** — если Катя запросит (drag & drop, ~50 botanical/watercolor PNG)
3. **Импорт JSON-бэкапа** — сейчас только экспорт, импорт не реализован
4. **Canvas обложки** — рисование своей обложки (сложно, откладывать)
5. **Push-уведомления** — напоминания (требует разрешения + SW push handler)
