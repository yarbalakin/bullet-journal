# Bullet Journal — PWA для Кати

## Суть проекта
Веб-приложение (PWA) bullet journal для одного пользователя (Катя). Красивый ежедневник с обложками, трекерами и сканером баркодов косметики.

## Статус
MVP-0 в разработке. Работает: главная с обложками, календарь с mood-цветами, задачи, события, трекер косметики, streak, Year in Pixels, облачный бэкап через n8n.

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
- `images/covers/` — 12 cottagecore-обложек (fal.ai Flux Pro)
- `assets/` — PWA-иконки (icon-192.png, icon-512.png)
- `PROJECT.md` — проектная документация (13 разделов)
- `RESEARCH.md` — исследование рынка (9 разделов, 50+ источников)

## n8n Cloud Sync
- **Workflow**: BuJo Cloud Sync (`HKWEWhNIBEwBLUdw`)
- **Webhook**: `https://estateinvest.app.n8n.cloud/webhook/bujo-sync`
- **Хранение**: workflow staticData (JSON)
- **Auto-sync**: при каждом dbPut/dbDelete с debounce 3 сек

## Правила
- Приложение для ОДНОГО пользователя — не нужна авторизация
- Фокус на эстетику и UX, не на техническую сложность
- Данные хранить локально (IndexedDB)
- Vanilla JS — без React/Vue/Angular
