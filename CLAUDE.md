# Bullet Journal — PWA для Кати

## Суть проекта
Веб-приложение (PWA) bullet journal для одного пользователя (Катя). Красивый ежедневник с обложками, трекерами и сканером баркодов косметики.

## Статус
MVP-1 завершён. Стикеры готовы (50 шт, 6 категорий). Собираем feedback от Кати.

## Версии (обновлять при каждом деплое)
- **SW кеш**: `CACHE_NAME = 'bujo-v54'` в sw.js — бампать при любом изменении JS/CSS/HTML
- **App version**: `APP_VERSION = '1.54'` в js/version.js — **всегда синхронизировать с номером кэша**: bujo-v54 → 1.54
- **IndexedDB**: `DB_VERSION = 5` в js/db.js — бампать только при изменении схемы сторов

## Правило бампа кэша
При каждом деплое (изменение JS/CSS/HTML):
1. Поднять `CACHE_NAME` в sw.js (bujo-vX → bujo-vX+1)
2. Поднять `APP_VERSION` в js/version.js (1.X → 1.X+1, номер совпадает с кэшем)
3. Обновить строку "SW кеш" выше с актуальным номером
4. Закоммитить и запушить

## Стек
- **Vanilla HTML/CSS/JS** — без фреймворков
- **PWA** — Service Worker для offline, manifest для установки на телефон
- **IndexedDB** — локальное хранение данных в браузере
- **html5-qrcode / quagga2** — сканер штрихкодов через камеру
- **Open Beauty Facts API** — поиск косметики по штрихкоду

## Дизайн
- Стиль: **"Уютный дневник"** (cozy / cottagecore)
- Палитра: крем, беж, приглушённый розовый, шалфей, лаванда
- Шрифты: Cormorant Garamond (заголовки) + Inter (контент)

## Основные функции (MVP-0)
- Обложки месяца (выбор из готовых)
- Календарь с mood-цветами
- Задачи и события
- Трекер косметики с баркод-сканером
- Mood tracker (5 уровней + Year in Pixels)
- Streak
- JSON-экспорт (бэкап)

## Деплой
- **URL**: https://yarbalakin.github.io/bullet-journal/
- **Repo**: https://github.com/yarbalakin/bullet-journal (public)
- **GitHub Pages**: legacy mode, branch main
- Push в main → автодеплой через 1-2 мин
- При обновлении бампать `CACHE_NAME` в sw.js

## Ключевые файлы
- `js/db.js` — IndexedDB + облачный sync через n8n
- `js/pages/` — страницы: home, calendar, day, tasks, cosmetics, pixels
- `js/sticker-system.js` — система стикеров (пикер + placement + drag/resize/rotate)
- `images/covers/` — 12 cottagecore-обложек (fal.ai Flux Pro)
- `images/stickers/` — 50 стикеров (Flux Pro + BiRefNet bg removal), manifest.json
- `assets/` — PWA-иконки (icon-192.png, icon-512.png)
- `PROJECT.md` — проектная документация (13 разделов)
- `RESEARCH.md` — исследование рынка (9 разделов, 50+ источников)

## Cloud Sync — Supabase
- **Project**: `fnqhdjazvqldtburpgvq.supabase.co`
- **Auth**: Google OAuth через `auth.js`
- **Хранение**: таблица `snapshots` (user_id PK, data JSONB)
- **Auto-sync**: при каждом dbPut/dbDelete с debounce 3 сек (`scheduleSyncToCloud`)
- **Миграция из n8n**: при первом входе `migrateFromN8nIfNeeded()` проверяет Supabase; если пусто — тянет данные из n8n webhook и сохраняет в Supabase. Одноразовая, потом не вызывается.

## Правила
- Приложение для ОДНОГО пользователя — не нужна авторизация
- Фокус на эстетику и UX, не на техническую сложность
- Данные хранить локально (IndexedDB)
- Vanilla JS — без React/Vue/Angular
