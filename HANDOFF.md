# Bullet Journal — Handoff

## Что готово (MVP-0 COMPLETE)
- Главная: 12 cottagecore-обложек (fal.ai Flux Pro), streak с milestone-бейджами (7/30/100/365), ссылки на sync/backup
- Календарь: месячная сетка, mood-цвета, фоновая обложка, навигация между месяцами
- Mood tracker: 5 категорий (Плохо/Тревожно/Грустно/Спокойно/Счастливый день), цвета (чёрный/фиолетовый/голубой/зелёный/оранжевый)
- Year in Pixels: годовая мозаика настроений
- Задачи: список на месяц с привязкой к дате, CRUD
- События: привязаны к дню, время + цвет
- Трекер косметики: добавление + удаление + сканер штрихкода (html5-qrcode + Open Beauty Facts API), PAO (срок годности), 12 типов
- Streak: счётчик дней подряд + milestone-бейджи (7/30/100/365 дней)
- Cloud sync: n8n webhook + staticData, auto-sync при каждом изменении (debounce 3с)
- Toast уведомления при синхронизации
- JSON-экспорт (бэкап)
- PWA-иконки (192x192, 512x512) + apple-touch-icon

## Деплой
- **URL**: https://yarbalakin.github.io/bullet-journal/
- **Repo**: https://github.com/yarbalakin/bullet-journal (public)
- **GitHub Pages**: legacy mode, branch main, path /
- Push в main → автодеплой через 1-2 мин
- **Service Worker**: кеширует все ассеты, при обновлении бампать `CACHE_NAME` в sw.js (сейчас v6)

## n8n Cloud Sync
- **Workflow**: BuJo Cloud Sync (`HKWEWhNIBEwBLUdw`), ACTIVE
- **Webhook**: `https://estateinvest.app.n8n.cloud/webhook/bujo-sync`
- **Хранение**: workflow staticData (JSON.stringify всех данных)
- POST `{action: "save", data: {...}}` → сохраняет
- POST `{action: "restore"}` → возвращает данные

## Файловая структура (в корне репо)
```
index.html          — SPA, 4 таба + html5-qrcode CDN
sw.js               — Service Worker (CACHE_NAME = bujo-v6)
manifest.json       — PWA manifest (start_url: ".")
css/style.css       — все стили
js/db.js            — IndexedDB + cloud sync + toast
js/router.js        — hash-based SPA роутер
js/app.js           — init, навигация, SW регистрация
js/pages/home.js    — главная с обложками + streak badges
js/pages/calendar.js — календарь + mood picker (5 категорий)
js/pages/day.js     — вид дня (события + задачи)
js/pages/tasks.js   — список задач месяца
js/pages/cosmetics.js — трекер косметики + barcode scanner
js/pages/pixels.js  — Year in Pixels
images/covers/      — 12 jpg обложек (768x1024)
assets/             — PWA иконки (icon-192.png, icon-512.png)
```

## IndexedDB (stores)
- `months` — инфо обложки (не используется пока)
- `tasks` — задачи (индексы: monthId, date)
- `events` — события (индекс: date)
- `moods` — настроения (keyPath: date, level 1-5)
- `cosmetics` — косметика (индекс: expireDate)
- `streak` — один объект id="main" (current, longest, lastDate)

## Что дальше (MVP-1)
- Стикеры (50-100 шт botanical/watercolor)
- Migration (мягкий, напоминание в конце месяца)
- Future Log (обзор на 6 месяцев)
- Collections (Books to Read, Wishlist, Gift Ideas, Brain Dump)