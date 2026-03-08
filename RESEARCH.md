# Исследование рынка Bullet Journal

> Дата: 2026-03-01. Два раунда исследования (5 агентов, 50+ источников).

---

## 1. Рынок BuJo приложений

**Размер:** $5.1-6.5 млрд (2025), рост ~11.5% CAGR, прогноз $13-19 млрд к 2033.

### Топ-10 приложений

| # | Приложение | Пользователи | Рейтинг | Модель | Цена | Фокус |
|---|---|---|---|---|---|---|
| 1 | GoodNotes | 24M+ | 4.8 | Freemium | $9.99/год, $29.99 разово | iPad + Apple Pencil, рукопись |
| 2 | Notion | 100M+ | 4.7 (G2) | Freemium | $10-18/мес | Универсальный, не чистый BuJo |
| 3 | Day One | — | 4.8 | Freemium | $34.99/год | Приватный дневник, E2E шифрование |
| 4 | Daylio | 393K+ отзывов GP | 4.8 | Freemium | $35.99/год | Mood tracker, иконки |
| 5 | Obsidian | — | 4.9 (community) | Бесплатно | $4/мес (sync) | Markdown, локальные файлы |
| 6 | Dynalist | — | 3.9-4.2 | Freemium | $47.88/год | Nested bullet lists |
| 7 | Journey | — | 4.3-4.4 | Freemium | $50/год, $199.99 пожизненно | Кросс-платформа, wellness |
| 8 | Grid Diary | — | 4.8/4.1 | Freemium | $22.99/год | Структурированная рефлексия |
| 9 | Elisi | — | 4.4/3.7 | Freemium | $6.99/мес | Простой планировщик |
| 10 | NotePlan | — | Высокий | Trial | $69.99/год | Markdown + календарь, Apple-only |

### Самые востребованные фичи (по отзывам)

1. **Habit tracker** — в каждом топовом, пользователи не хотят отдельное приложение
2. **Шаблоны из коробки** — главная боль: люди не хотят проектировать layout с нуля
3. **Кросс-устройственная синхронизация**
4. **Offline-режим**
5. **Mood tracking** — визуальная статистика, Year in Pixels
6. **Приватность и шифрование**
7. **Мультимедиа** — фото, аудио
8. **Импорт PDF-шаблонов**
9. **Напоминания и calendar view**
10. **AI-подсказки** — растущий тренд

### Главные жалобы пользователей

- Слишком много фич за paywall
- Нет нормального Windows-приложения у лидеров
- "Официальное приложение Bullet Journal — пустая трата денег"
- Подписки растут в цене

---

## 2. Женские планировщики

### Ключевые приложения

| Приложение | Платформа | Рейтинг | Цена | Уникальность |
|---|---|---|---|---|
| **Zinnia** | iOS (iPad) | 4.6, 52K отзывов | $35/год | Тысячи стикеров, washi tape, рукопись |
| **Floret** | iOS | — | $15/год | Self-care journal, gratitude, mood |
| **Finch** | iOS+Android | 4.95, 550K отзывов | Freemium | Виртуальный питомец, self-care |
| **Cute Calendar** | iOS+Android | — | Freemium + IAP | 500+ стикеров, mood diary |
| **Artful Agenda** | iOS+Android | — | $35/год | Стили почерка + стикеры |
| **Moodji** | iOS | — | Freemium | Sticker Shop, earn & unlock |
| **Planbella** | iOS | — | One-time | Gratitude, cute виджеты |

### Дизайн-тренды 2025-2026

| Стиль | Описание | Где |
|---|---|---|
| **Watercolor botanical** | Пастельные акварельные цветы, зелень, розово-белые тона | Доминирует: Zinnia, GoodNotes шаблоны |
| **Minimalist / clean** | Белый фон, sans-serif, максимум воздуха | Floret, Onrise |
| **Kawaii** | Пузатые животные, пастель, закруглённые формы | Cute Calendar, Finch, Moodji |
| **Cottagecore / cozy** | Природные текстуры, уют, тёплые оттенки | Finch, Eden |
| **Dark Academia** | Готика, лунные леса, тёмные тона | GoodNotes шаблоны |
| **Botanical + lunar** | Лунные фазы, астрология, цветы | Растущий тренд |

### Уникальные фичи

- **Трекер менструального цикла** — отдельная ниша (Flo 10M+, Clue 10M+). Комбинация цикл + планировщик = почти незанятая ниша
- **Mood tracker** — Daylio (иконки, Year in Pixels), Moodji (стикеры за прогресс), Reflectly (AI-промпты)
- **Habit tracker с gamification** — Finch (питомец), Habitica (RPG), Habit Rabbit (Animal Crossing-стиль)
- **Gratitude journal** — Floret, Planbella, 5 Minute Journal
- **Стикеры** — ключевое конкурентное преимущество. Etsy-экосистема: 56K+ hand-drawn стикеров для GoodNotes

---

## 3. Трекеры косметики

### Существующие приложения

| Приложение | Платформа | Сканер EAN | Batch-код | PAO | Уведомления |
|---|---|---|---|---|---|
| **CosmeTick** | iOS | Да | Нет | Да (умный) | Да |
| **Beauty Keeper** | iOS/Android | Нет | Да (880+ брендов) | Да (60 типов) | Да (1 мес + день) |
| **BEEP** | iOS/Android | Да | Нет | Нет | Да |
| **Cosmetic Checker** | iOS/Android | Нет | Да | Нет | Нет |

**Рынок почти пуст** — нет единого решения EAN + PAO + уведомления.

### Базы данных косметики

| База | Продуктов | Тип | Цена | API |
|---|---|---|---|---|
| **Open Beauty Facts** | 100K+ | Open-source | Бесплатно | `world.openbeautyfacts.org/api/v2/product/{barcode}.json` |
| **UPCitemdb** | 686M+ | Коммерческая | 100 запросов/сутки free | REST API |
| **Go-UPC** | 1B+ | Коммерческая | Платно | JSON API |
| **Barcode Lookup** | Сотни млн | Коммерческая | Платно | REST API |

**Критично для РФ:** Open Beauty Facts слабо покрывает российский рынок. Ручной ввод будет основным путём.

### PAO дефолты по типу продукта

| Продукт | PAO (месяцев) |
|---|---|
| Тушь для ресниц | 3-6 |
| Жидкая подводка | 3-6 |
| Тональный крем | 6-12 |
| Консилер | 6-12 |
| Крем для лица (с помпой) | 6-10 |
| Помада | 12-18 |
| Румяна (кремовые) | 12 |
| Сухие тени | 24 |
| Пудра | 24 |
| Карандаш для глаз | 24 |
| Духи | 36+ |

### Технический стек сканера

- **ML Kit (Google)** — лучший: on-device, без интернета, iOS + Android
- React Native: `react-native-vision-camera` + ML Kit plugin
- Flutter: `mobile_scanner` (pub.dev)
- Поддержка: EAN-13, EAN-8, UPC-A, UPC-E, QR, Data Matrix

### Batch-коды

Закрытая информация производителей. Нет публичного API. Веб-сервисы: checkcosmetic.net, checkfresh.com, batchcode.org — только UI, без API. **Вывод: не включать в MVP.**

---

## 4. Система Ryder Carroll (оригинальный Bullet Journal)

### Rapid Logging

| Символ | Тип | Состояния |
|---|---|---|
| `•` | Задача | `×` выполнена, `>` мигрирована, `<` в Future Log |
| `○` | Событие | привязано к дате |
| `—` | Заметка | идея, наблюдение, факт |

**Signifiers** (приоритеты): `*` приоритет, `!` идея, `?` уточнить.

### Ключевые элементы

- **Index** — оглавление, автоматически в цифре
- **Future Log** — сетка на 6 месяцев, парковка задач/событий на будущее
- **Monthly Log** — обзор месяца: календарь (числа + события) + задачи на месяц
- **Daily Log** — записи дня в реальном времени, дни идут один за другим без пустых страниц
- **Collections** — тематические страницы (книги, подарки, рецепты), добавляются в Index
- **Migration** — в конце месяца: каждая незавершённая задача → перенести / отменить / в Future Log. Ручное переписывание = осознанное решение
- **Threading** — связывание страниц: `→ 54` на одной, `40 →` на другой

### Как перенести в цифру

| Проблема | Решение |
|---|---|
| Тактильный ритуал | Звуковая обратная связь, анимации |
| Migration как усилие | Пошаговый обзор задач (по одной), нельзя "перенести всё" |
| Свободный layout | Шаблоны визуальных трекеров (термометры, мандалы) |
| Threading | Двусторонние ссылки (как Obsidian) |
| Вклейки (ephemera) | Импорт фото, сканов |
| Нет оповещений | Опциональные напоминания, не превращать в task manager |

---

## 5. Идеи для spreads (50+)

### Здоровье и привычки
- Habit tracker (сетка: привычки × дни)
- Anti-Habit tracker (что НЕ делать)
- Mood tracker (Year in Pixels, мандала)
- Sleep tracker (горизонтальная шкала 22:00-08:00)
- Energy level tracker (утро/день/вечер)
- Water intake (8 стаканов)
- Period tracker (симптомы, цикл)
- Pain/Symptom log

### Рефлексия и ментальное здоровье
- Gratitude log (3 вещи/день)
- Brain dump (свободная страница → разбор на задачи/идеи/мусор)
- Wins wall (достижения, открывать в плохой день)
- Anxiety log (триггер → симптом → мысль → ответ)
- Weekly reflection (что получилось / что нет / чему научился)
- Dream journal
- Cognitive distortion tracker (из CBT)

### Цели и проекты
- Level 10 Life (колесо жизни, 10 сфер, оценка 1-10)
- Quarterly goal sprint (90-дневные цели)
- Vision board (коллаж желаемого будущего)
- Someday/Maybe list (обзор раз в квартал)
- The One Thing (одна важнейшая задача в неделю)
- Ideal Week Design (план идеальной недели vs реальная)

### Финансы
- Monthly expense tracker (категории, бюджет vs факт)
- Savings thermometer (визуальный прогресс)
- No-spend day challenge
- Subscription audit (список всех подписок)
- Bill payment tracker

### Контент
- Books to read / read (рейтинг + ключевая мысль)
- Movies/Shows to watch
- Podcast notes
- Quotes collection
- Recipe collection

### Дом и быт
- Meal planner (завтрак/обед/ужин × дни)
- Cleaning schedule (ежедневные/еженедельные/ежемесячные)
- Plant care tracker (полив, пересадка)
- Capsule wardrobe (что реально носишь)
- Home maintenance log

### Путешествия
- Bucket list / Travel wishlist
- Trip planner (маршрут, жильё, бюджет)
- Local exploration (кафе, парки в своём городе)

### Социальное
- Birthday tracker
- Gift ideas collection (для близких)
- Connection cadence tracker (когда последний раз общался)
- Date night ideas

---

## 6. Приложения-вдохновители

### Finch: Self-Care Pet
- 4.95/5, 550K+ отзывов, вирусный в TikTok
- Виртуальный птенец, растёт от выполнения целей
- Не умирает при пропуске (в отличие от Tamagotchi)
- **Инсайт:** "Ты заботишься о птице, а не о себе" — психологически проще

### Untold: Voice Journal
- Говоришь голосом → AI расшифровывает → отвечает обратно
- Hume AI анализирует эмоции по голосу
- Бесплатно

### Rosebud: AI Journal
- $6M инвестиций (TechCrunch, 2025)
- AI задаёт уточняющие вопросы, авто-теги
- "Happiness Recipe" — персональные стратегии
- "Learned Preferences" — помнит стиль пользователя

### 1 Second Everyday
- 1 секунда видео в день → фильм года (6 минут)
- Ультра-низкий барьер входа + максимальная награда

### Waffle: Shared Journal
- #1 shared journal для пар/семей
- 10K+ промптов, 10-дневные challenges
- Промпты помогают "открывать новое друг о друге"

### Polarsteps
- Map-first travel journal — маршрут на карте + фото + тексты
- Автоматически генерирует печатную книгу путешествия (от €36)

### Timehop
- "This Day in History" — воспоминания из прошлых лет
- Контент живёт 24 часа (FOMO), streak + бейджи
- 20M+ пользователей

---

## 7. Retention-механики

| Механика | Эффект | Пример |
|---|---|---|
| **Streaks** | +2.3x retention при 7+ днях | Duolingo, Timehop, TickTick |
| **Companion** | Сильнее streak — ответственность перед существом | Finch (питомец-птица) |
| **Nostalgia ("On This Day")** | Эмоциональный hook, ежедневный повод открыть | Day One, Google Photos, Timehop |
| **Personalization** | Чем дольше используешь, тем больше "твоё" | Rosebud (learned preferences) |
| **Rewards** | Разблокировка контента за прогресс | Moodji (стикеры за Leaf points) |

---

## 8. Критический разбор (10 пунктов)

1. **MVP раздулся** — начинали с 4 фич, дошло до 10+. Решено: разделить на MVP-0 и MVP-1
2. **Стикеры с drag & drop — не простая фича.** Жесты (pinch, rotate), хранение позиций, рендеринг — 2-3 недели работы. Вынесены в MVP-1
3. **Трекер косметики — отдельное приложение внутри приложения.** Open Beauty Facts = 100K продуктов, российская косметика почти не покрыта. Ручной ввод будет основным
4. **"On This Day" бесполезен первый год.** Вынесен в v1.1
5. **Migration с блокировкой может раздражать.** Решено: мягкий вариант (напоминание, не блокировка)
6. **Локальное хранение без бэкапа = потеря данных.** Решено: JSON-экспорт в MVP-0
7. **Обложки — откуда 12+ иллюстраций?** Варианты: AI-генерация, стоки, заказ. Открытый вопрос
8. **Один пользователь vs рынок** — если только для Кати, scope можно ужать. Если для рынка, нужна другая архитектура
9. **5 табов — перегружено.** Решено: MVP-0 = 4 таба, 5-й добавляется в MVP-1
10. **Collections по сути = Apple Notes.** Нужно дать ценность сверх заметок (пресеты, интеграция с календарём)

---

## 9. Источники

### Рынок BuJo
- [10 Best Apps for Bullet Journaling (PlanWiz)](https://blog.planwiz.app/best-apps-for-bullet-journaling/)
- [Top 10 Apps for Bullet Journal (NotePlan)](https://noteplan.co/blog/top-10-apps-for-bullet-journal)
- [10 Digital Journal Apps (ClickUp)](https://clickup.com/blog/digital-journal-apps/)
- [Best Journal Apps 2025 (Rosebud)](https://www.rosebud.app/blog/best-journal-apps)
- [Digital Bullet Journaling Apps (TechForNomads)](https://techfornomads.com/2025/08/06/digital-bullet-journaling-apps-that-actually-work/)
- [Digital Journal Apps Market Size 2025-2035](https://www.futuremarketinsights.com/reports/digital-journal-apps-market)
- [11 Best Free Bullet Journal Apps (Freeappsforme)](https://freeappsforme.com/free-bullet-journal-apps/)

### Женские планировщики
- [13 Top Cute Planner Apps 2025 (Upbase)](https://upbase.io/blog/best-cute-planner-apps/)
- [Top 10 Aesthetic Planner Apps (ClickUp)](https://clickup.com/blog/aesthetic-planner-apps/)
- [Aesthetic Planner Apps (Toolfinder)](https://toolfinder.com/lists/aesthetic-planner-apps)
- [Cute Habit Tracker Apps (Gridfiti)](https://gridfiti.com/aesthetic-habit-tracker-apps/)
- [Best Mood Tracker Apps (Lume)](https://lumejournalapp.com/the-best-mood-tracker-apps-in-2025/)
- [Top Period Tracker Apps (Syscreations)](https://www.syscreations.ca/top-period-tracker-female-health-apps/)
- [Finch Self-Care App Review (Autonomous)](https://www.autonomous.ai/ourblog/finch-self-care-app-review-full-breakdown)

### Трекеры косметики
- [CosmeTick: Expiry Tracker (App Store)](https://apps.apple.com/us/app/cosmetick-expiry-tracker/id6751162352)
- [BEEP - Expiry Date Scanner](https://www.beepscan.com/en)
- [Open Beauty Facts - Data & API](https://world.openbeautyfacts.org/data)
- [Check Cosmetic.net](https://checkcosmetic.net/)
- [Checkfresh.com](https://www.checkfresh.com/)
- [Batchcode.org](https://batchcode.org/)
- [ML Kit vs ZXing (Scanbot)](https://scanbot.io/blog/ml-kit-vs-zxing/)
- [mobile_scanner Flutter](https://pub.dev/packages/mobile_scanner)

### Система BuJo
- [Rapid Logging — Bullet Journal Official](https://bulletjournal.com/blogs/faq/what-is-rapid-logging-understand-rapid-logging-bullets-and-signifiers)
- [BuJo Guide (Tiny Ray of Sunshine)](https://www.tinyrayofsunshine.com/blog/bullet-journal-guide)
- [Migration (Bullet Journal Official)](https://bulletjournal.com/pages/migration)
- [65+ Bullet Journal Ideas (mylifenote.ai)](https://blog.mylifenote.ai/bullet-journal-ideas/)
- [200+ BuJo Collections (Diary of a Journal Planner)](https://diaryofajournalplanner.com/bullet-journal-collections/)
- [75+ BuJo Ideas (Life's Carousel)](https://www.lifescarousel.com/bullet-journal-ideas/)
- [Habit Tracker Ideas (Masha Plans)](https://mashaplans.com/bullet-journal-habit-tracker-ideas/)
- [BuJo Trends 2025 (WashiGang)](https://www.washigang.com/blogs/news/bullet-journal-trends-to-watch-in-2025)

### Приложения-вдохновители
- [Untold App](https://www.untoldapp.com/)
- [Rosebud: AI Journal](https://www.rosebud.app/)
- [Rosebud lands $6M (TechCrunch)](https://techcrunch.com/2025/06/04/rosebud-lands-6m-to-scale-its-interactive-ai-journaling-app/)
- [Waffle: Shared Journal](https://www.wafflejournal.com/)
- [Polarsteps](https://news.polarsteps.com/news/polarsteps-summer-2025-release-is-here)
- [Finch: Self-Care Pet (App Store)](https://apps.apple.com/us/app/finch-self-care-pet/id1528595748)
- [Magic of Finch Design (Sophie Pilley)](https://www.sophiepilley.com/post/the-magic-of-finch-where-self-care-meets-enchanted-design)
- [Timehop (App Store)](https://apps.apple.com/us/app/timehop-memories-then-now/id569077959)

### Retention и UX
- [Streaks for Gamification (Plotline)](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [Productivity Gamification Examples (Trophy)](https://trophy.so/blog/productivity-gamification-examples)
- [Best Gratitude Apps (Mindful Browsing)](https://www.mindfulbrowsing.com/best-gratitude-apps/)
- [Digital Planners 2026 (Goodnotes)](https://www.goodnotes.com/blog/digital-planners)
- [Best Voice Journal App (Journaling Insights)](https://journalinginsights.com/best-voice-journal-app/)
