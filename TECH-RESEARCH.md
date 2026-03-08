# Техническое исследование: Bullet Journal

> Дата: 2026-03-01. Три исследовательских агента, 50+ источников.
> Включает: полное исследование стеков, open-source проекты, реализацию фич, критический разбор, скорректированный план.

---

## Часть 1: Стеки и архитектура

### Мобильные фреймворки: сравнение

#### Flutter — лидер для кастомного UI

- Единая кодовая база iOS + Android + Web + Desktop
- Собственный рендеринг (без JS-bridge), компиляция в ARM
- 170k GitHub stars, 46% разработчиков используют (vs 35% React Native)
- Dart — простой язык, похожий на Java/Kotlin
- State management: **Riverpod 3.0** (сентябрь 2025) — макрос `@riverpod`, Notifier/AsyncNotifier
- Календарные виджеты: [table_calendar](https://pub.dev/packages/table_calendar), [kalender](https://github.com/werner-scholtz/kalender)
- Рендеринг: ~16ms/кадр (60fps), ~8ms (120fps)

Источники: [Flutter vs RN (Droids on Roids)](https://www.thedroidsonroids.com/blog/flutter-vs-react-native-comparison), [Flutter Performance](https://softssolutionservice.com/blog/best-flutter-ui-practices-high-performance-apps)

#### React Native + Expo — альтернатива для JS-разработчиков

- Expo New Architecture по умолчанию; 83% проектов SDK 54 используют (январь 2026)
- EAS Build кеширует компоненты, +30% скорость сборки
- Деплой в TestFlight без Xcode
- Быстрее всего для MVP (3-5 дней для простого приложения)
- Минус: для кастомных анимаций Flutter удобнее

Источники: [Expo New Architecture](https://docs.expo.dev/guides/new-architecture/), [RN in 2026](https://www.euroshub.com/blogs/react-native-2026-whats-new-and-what-to-expect)

#### Native (SwiftUI / Kotlin) — не для соло

- Две кодовые базы = двойная работа
- Только если целишься исключительно на iOS

### Web-приложение / PWA

- В 2026 браузеры полноценно поддерживают Service Workers, Web App Manifest, Web Push
- Next.js 15/16 + Serwist для service worker, IndexedDB для хранения
- Стоимость разработки на 68% ниже нативных приложений
- **Ограничения:** Push на iOS ограничены, нет HealthKit, нет виджетов, нет App Store монетизации
- **Вывод:** PWA — хороший вариант для веб-версии или MVP, но не полная замена нативному приложению

Источники: [PWA 2026 Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide), [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-apps), [PWA vs Native](https://progressier.com/pwa-vs-native-app-comparison-table)

---

### Backend: Firebase vs Supabase vs Appwrite

| Критерий | Firebase | Supabase | Appwrite |
|---|---|---|---|
| БД | Firestore (NoSQL) | PostgreSQL (SQL) | MariaDB (NoSQL API) |
| Open-source | Нет | Да | Да |
| Self-hosting | Нет | Да | Да |
| Flutter SDK | Официальный | Community (хороший) | Официальный (Dart) |
| Apple Sign-In | Да | Да | Да |
| Real-time sync | Отличный | Хороший | Хороший |
| Vendor lock-in | Высокий | Низкий | Низкий |
| Бесплатный тариф | Щедрый | Щедрый | Щедрый |

**Supabase** — лучший для планера: PostgreSQL для реляционных данных, RLS из коробки, Edge Functions, нет vendor lock-in.
**Firebase** — если нужна максимальная скорость запуска, но vendor lock-in и непредсказуемые цены.
**Appwrite** — лучший Dart SDK, но NoSQL менее удобен для реляционных данных.

Источники: [UI Bakery сравнение](https://uibakery.io/blog/appwrite-vs-supabase-vs-firebase), [Appwrite BaaS Guide](https://appwrite.io/blog/post/choosing-the-right-baas-in-2025)

---

### Локальные базы данных

#### Drift (Flutter) — рекомендация #1
- Типобезопасный ORM поверх SQLite
- Реактивные запросы (UI обновляется при изменении данных)
- Миграции, сложные запросы, JOIN
- Интеграция с PowerSync для cloud-sync

#### WatermelonDB (React Native)
- SQLite-based, оптимизирован для RN
- Ленивая загрузка, десятки тысяч записей
- Встроенная sync-инфраструктура

#### Realm
- Быстрый, но привязан к MongoDB Atlas для синхронизации

Источники: [Drift Guide](https://dinkomarinac.dev/best-local-database-for-flutter-apps-a-complete-guide), [RN Local DB Options](https://www.powersync.com/blog/react-native-local-database-options)

---

### Стратегия синхронизации: Local-First

Архитектура 2026: устройство хранит полную копию, облако — relay.

**Рекомендуемый стек для Flutter:** Drift + PowerSync + Supabase
- Drift — локальная SQLite как source of truth
- PowerSync — sync между устройствами через Supabase
- Supabase — облачный PostgreSQL + auth + RLS

Источники: [Local-First Flutter](https://dinkomarinac.dev/blog/building-local-first-flutter-apps-with-riverpod-drift-and-powersync/), [PowerSync + Supabase](https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync), [CRDT Sync 2026](https://dev.to/devin-rosario/advanced-syncing-algorithms-for-collaborative-mobile-apps-in-2026-1a60)

---

### Модель данных (полная версия)

```sql
users (id, email, name, settings_json, created_at)
tasks (id, user_id, title, description, due_date, completed, priority, list_id, recurring_rule)
events (id, user_id, title, start_at, end_at, recurrence_rule, color, reminder_minutes)
habits (id, user_id, name, frequency, target_count, color, icon, streak_current, streak_longest)
habit_logs (id, habit_id, date, completed, value)
moods (id, user_id, date, mood_score, emotions[], tags[], notes, energy_level)
cycle_entries (id, date, cycle_day, flow, symptoms[], basal_temp, cervical_mucus, notes) -- LOCAL ONLY
goals (id, user_id, title, description, deadline, progress_percent, category)
journal_entries (id, user_id, date, title, content_md, mood_id, tags[], images[])
```

---

### No-Code / Low-Code

#### FlutterFlow — лучший из no-code
- Генерирует чистый Dart-код, можно экспортировать
- Прототип за 3 часа
- Деплой iOS/Android/Web из одного места
- **НО:** при 10-20+ экранах тормозит, 50%+ жалуются на производительность
- Экспортированный код часто требует переработки

#### Adalo — НЕ подходит
- Тормозит при 1000+ записях, нет экспорта кода

#### Glide — только для внутренних инструментов

**Вывод:** FlutterFlow только для прототипа/MVP, не для финального продукта.

Источники: [FlutterFlow Review 2026](https://hackceleration.com/flutterflow-review/), [Adalo vs FlutterFlow](https://cybernews.com/ai-tools/adalo-vs-flutterflow/)

---

## Часть 2: Open-source проекты и коммерческие приложения

### Bullet Journal / Planner (open-source)

| Проект | Стек | GitHub |
|--------|------|--------|
| **BulletJournal** | Java (Spring Boot) + React | [singerdmx/BulletJournal](https://github.com/singerdmx/BulletJournal) |
| **RocketLog** | Laravel + Vue.js | [jessarcher/rocketlog](https://github.com/jessarcher/rocketlog) |
| **BulletBuddy** | PWA (JavaScript) | [nathanielgreen/bulletbuddy](https://github.com/nathanielgreen/bulletbuddy) |
| **MERN Bullet Journal** | MongoDB + Express + React + Node | [Shysh-Oleksandr/bullet-journal](https://github.com/Shysh-Oleksandr/bullet-journal) |

### Self-hosted планировщики (крупные)

| Проект | Стек | Описание |
|--------|------|----------|
| **[Vikunja](https://vikunja.io/)** | Go + Vue.js + Flutter | Альтернатива Todoist/ClickUp |
| **[AppFlowy](https://appflowy.com/)** | Rust + Flutter + Dart | Альтернатива Notion |
| **[Super Productivity](https://super-productivity.com/)** | Angular + Electron | Тайм-трекинг, Pomodoro |

### Habit Trackers (open-source)

| Проект | Стек | Stars | GitHub |
|--------|------|-------|--------|
| **Loop Habit Tracker** | Kotlin Multiplatform | ~9.3k | [iSoron/uhabits](https://github.com/iSoron/uhabits) |
| **Habitica** | Node.js + React + MongoDB | ~12k+ | [HabitRPG/habitica](https://github.com/HabitRPG/habitica) |
| **Habo** | Flutter | — | [xpavle00/Habo](https://github.com/xpavle00/Habo) |
| **BeaverHabits** | Python (NiceGUI/FastAPI) + SQLite | — | [daya0576/beaverhabits](https://github.com/daya0576/beaverhabits) |

### Mood Trackers (open-source)

| Проект | Стек | GitHub |
|--------|------|--------|
| **KeepMood** | Flutter + SQLite | [Epse/keepmood](https://github.com/Epse/keepmood) |
| **Mood Tracker RN** | React Native + Redux + Expo | [CaioCamatta/mood-tracker-react-native](https://github.com/CaioCamatta/mood-tracker-react-native) |

### Period/Cycle Trackers (open-source)

| Проект | Стек | Описание |
|--------|------|----------|
| **Drip** | React Native | Самый зрелый, симптотермальный метод, App Store + Google Play + F-Droid |
| **Peri** | — | [IraSoro/peri](https://github.com/IraSoro/peri) |
| **Period Tracker PWA** | JavaScript (PWA) | [electricg/period-tracker](https://github.com/electricg/period-tracker) |

### Коммерческие приложения — tech stacks

**Notion:** React + Redux, Node.js, AWS (EC2/S3/RDS), PostgreSQL, block-based атомарная модель, Kafka CDC → Spark → S3
**Todoist:** Python + AWS (backend), React + Redux (web), Swift/Kotlin (mobile), исследуют Kotlin Multiplatform
**Habitica:** Express.js + MongoDB + React + Redux, 25,800+ коммитов, 860+ контрибьюторов, полностью open-source
**Flo:** ML/AI на Tecton, 1600+ ML-фич, Period/Ovulation Cycle Prediction
**Daylio:** всё локально, бэкап через Google Drive / iCloud зашифрованный, PIN/Fingerprint/Face ID

---

## Часть 3: UI/UX библиотеки

### Calendar Components

**React Native:**
- `react-native-calendars` (Wix) — самая популярная, Day/Week/Month/Agenda. Проблема: перерендер всех 30+ ячеек при смене даты
- `react-native-calendar-kit` — мощная, кастомизируемая, drag-and-drop
- `react-native-big-calendar` — для крупных видов

**Flutter:**
- `table_calendar` — популярная, простая
- `kalender` — Day/MultiDay/Month/Schedule с drag-and-drop
- `syncfusion_flutter_calendar` — heatmap через `monthCellBuilder`

### Chart/Visualization

| Библиотека | Применение |
|------------|-----------|
| react-native-gifted-charts | Bar, Line, Pie, **Contribution Graph (heat map)** |
| Victory Native | Composable, одинаковый API web/mobile |
| React Native Chart Kit | Line, Bezier, Pie, **GitHub-style heat map** |
| React Native Skia | GPU-рендеринг, сложные анимации |
| fl_chart (Flutter) | Основные графики |

### Animation Libraries

| Библиотека | Назначение |
|------------|-----------|
| React Native Reanimated | Основные анимации, 60+ FPS |
| Lottie | After Effects анимации |
| Moti | Декларативные анимации поверх Reanimated |
| Rive | Интерактивные анимации (Flutter/RN/Web) |

### UI Component Libraries

| Библиотека | Особенности |
|------------|-------------|
| Gluestack UI v2 | 40+ компонентов, Tailwind + NativeWind, shadcn/ui-стиль |
| Tamagui | Performance-focused, универсальные стили web + mobile |
| NativeWind | Tailwind CSS для React Native |

### Figma UI Kits

- [Untitled UI](https://www.untitledui.com/) — 420+ страниц, React компоненты
- Material 3 Design Kit (Google)
- Apple iOS 18 UI Kit
- [Plus UI](https://www.figma.com/community/file/1310670219738074447) — FREE, 2000+ вариантов

---

## Часть 4: Реализация ключевых фич

### Mood Tracking

**Модель данных:**
```typescript
interface MoodEntry {
  id: string;
  userId: string;
  timestamp: Date;
  moodValue: number;       // 1-10
  valence: number;          // -1.0 ... +1.0 (неприятно → приятно)
  arousal: number;          // -1.0 ... +1.0 (спокойно → возбужденно)
  emotions: string[];       // ["happy", "anxious", "grateful"]
  tags: string[];           // ["#work", "#exercise"]
  notes: string;
  sleepHours?: number;
  cycleDay?: number;
}
```

Подход с valence + arousal основан на [модели Russell](https://positivepsychology.com/mood-charts-track-your-mood/) — 4 квадранта: happy, angry, sad, relaxed.

**Mood Calendar (Heatmap):** сетка, каждая ячейка = 1 день, цвет по moodValue. React: [react-heat-map](https://uiwjs.github.io/react-heat-map/). Flutter: `syncfusion_flutter_calendar` + `monthCellBuilder` или [simple_heatmap_calendar](https://github.com/FriesI23/simple_heatmap_calendar).

**Корреляции:** Pearson/Spearman между mood_value и habit completions / cycle day. [Bearable](https://bearable.app/) — лидер в автоматических корреляциях.

### Habit Tracker

**Streak алгоритм:**
```typescript
function calculateStreak(completions: {date: string; done: boolean}[]): {current: number; longest: number} {
  const sorted = [...completions].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let current = 0;
  for (const entry of sorted) {
    if (entry.done) current++; else break;
  }
  let longest = 0, temp = 0;
  for (const entry of completions) {
    if (entry.done) { temp++; longest = Math.max(longest, temp); }
    else temp = 0;
  }
  return { current, longest };
}
```

Для нерегулярных привычек (3 раза в неделю): period-based streak, как в [Habitica](https://habitica.fandom.com/wiki/Streaks).

**Важно:** timezone пользователя + "grace period" (до 3-4 утра для "сов").

**Уведомления:** Expo: `expo-notifications` (local scheduling). React Native bare: [Notifee](https://notifee.app/). Flutter: `flutter_local_notifications`.

**Геймификация (Habitica как референс):** XP + Gold → уровни → виртуальные предметы. Badges: прогресс-бары, hidden achievements, multi-tier (bronze/silver/gold), streak milestones.

### Period/Cycle Tracker

**Алгоритмы предсказания:**
1. Calendar-based — Moving Average по последним 3-6 циклам. Простой, для MVP.
2. ARIMA / Time Series — [arXiv исследование](https://arxiv.org/abs/2308.07927) показывает хорошие результаты.
3. ML с биометрией — [Ultrahuman Algo 2.0](https://blog.ultrahuman.com/blog/cycle-and-ovulation-algo-2-0/), accuracy 85%+ с wearable.

Open-source: [cilab-ufersa/period_cycle_prediction](https://github.com/cilab-ufersa/period_cycle_prediction)

**Что отслеживать:**
```typescript
interface CycleDay {
  date: Date;
  cycleDay: number;
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  basalBodyTemp?: number;
  symptoms: string[]; // cramps, headache, bloating...
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';
  moodValue?: number;
  notes?: string;
}
```

**ПРИВАТНОСТЬ — КРИТИЧНО:** Post-Roe (USA) данные period trackers юридически опасны. Архитектура: LOCAL-FIRST only, SQLCipher шифрование, никакого облака без explicit opt-in, E2E encryption если sync, отсутствие analytics SDKs.

### Calendar & Scheduling

**Recurring events — RFC 5545 (iCal RRULE):**
- JS/TS: [rrule.js](https://github.com/jkbrzt/rrule) — парсинг, сериализация, natural language
- Flutter: `firstfloor_calendar` — полная RFC 5545 поддержка
- Хранение: строка `RRULE:FREQ=WEEKLY;BYDAY=MO,WE` в БД

**Drag-and-drop:** react-native-calendar-kit (allowDragToCreate), Syncfusion Flutter Calendar, react-big-calendar (web).

**Интеграция Google/Apple Calendar:** через нативные calendar APIs устройства — [expo-calendar](https://docs.expo.dev/versions/latest/sdk/calendar/) даёт доступ ко всем подключённым аккаунтам.

### AI-фичи

**AI journaling prompts:** LLM ведёт интерактивный диалог, извлекает structured data из свободного текста. Промпты по контексту (mood_low, streak milestone, cycle phase). Референс: [Mindsera](https://www.mindsera.com/).

**Smart task prioritization:** LLM классифицирует по Eisenhower Matrix (urgency + importance). Примеры: [PrioritAI](https://splitti.app/eisenhower/).

**Pattern recognition:** Statistical correlations (Pearson/Spearman) между mood, habits, cycle + LLM summarization для insights. [PMC источник](https://pmc.ncbi.nlm.nih.gov/articles/PMC12349093/).

**NLP парсинг задач:** [chrono-node](https://www.npmjs.com/package/chrono-node) для "remind me tomorrow at 3pm" → Date. Или прямой вызов LLM (GPT-4o-mini, Claude Haiku) — дешево, точно, любой язык.

**AI-Generated Summaries:** промпт с serialized_weekly_data → краткий отчёт (mood, habits, patterns, рекомендация).

### Виджеты (iOS/Android)

React Native НЕ поддерживает виджеты напрямую — пишутся нативно:
- iOS: Swift + App Groups
- Android: Kotlin + SharedPreferences
- Flutter: `home_widget` package
- Expo: `@bacons/apple-targets`
- +43% daily engagement у пользователей с виджетами

### PDF Export

- Expo: `expo-print` (генерит PDF из HTML)
- RN bare: `react-native-html-to-pdf`

---

## Часть 5: Приватность, безопасность, GDPR

### Шифрование

**SQLCipher** — стандарт encrypted SQLite:
- AES-256 в CBC mode
- 5-15% overhead по производительности
- Key derivation: PBKDF2 с SHA-256, 600,000 iterations
- Ключи хранить в iOS Keychain / Android Keystore
- Transport: TLS 1.3 + Perfect Forward Secrecy

### GDPR

- Privacy by Design & Default (Article 25)
- Explicit consent для health data (Article 9)
- Right to erasure — полное удаление
- Data portability — экспорт в JSON/CSV
- DPIA обязателен для health data
- FTC штраф Cerebral $7.8M (2024) — прецедент

### Health Data Regulations

- GDPR (EU): health data = special category
- HIPAA (US): НЕ применяется к consumer apps, но FTC Health Breach Notification Rule (2024) покрывает gap
- My Health My Data Act (Washington State) — первый US state law для consumer health data
- 73% пользователей считают privacy ключевым фактором

### Offline-First: Conflict Resolution

1. **Last-Write-Wins (LWW)** — простейший, но потеря данных при одновременном редактировании
2. **Operational Transformation (OT)** — как в Google Docs, сложен
3. **CRDT** — гарантированная конвергенция без координации, рекомендуемый

**CRDT Libraries:**
- [Yjs](https://github.com/yjs/yjs) — ~13KB, текст, high performance
- [Automerge](https://automerge.org/) — JSON-native, Rust/WASM, mobile FFI
- [Loro](https://loro.dev/) — Rust/WASM, richtext + structured data
- [PowerSync](https://www.powersync.com/) — Postgres ↔ SQLite sync layer (проще CRDT)

---

## Часть 6: Монетизация

### Subscription SDK

| SDK | Цена | Особенности |
|-----|------|-------------|
| **RevenueCat** | Бесплатно до $2.5k MTR | Стандарт, iOS/Android/Flutter/RN/Web |
| **Adapty** | $99/mo за первые $10k MTR | Встроенный paywall builder, A/B |
| **Superwall** | — | No-code paywalls, Expo SDK |

**RevenueCat** — лучший для старта. С апреля 2025 поддерживает web-подписки (обход 30% комиссии App Store в США).

### Стратегия

- **Freemium + Subscription** — $4.99-6.99/мес или $39.99-49.99/год
- Hard paywall: 78% пользователей начинают trial в первую неделю
- Trial: 7-14 дней — sweet spot
- 30% annual подписок отменяются в первый месяц

---

## Часть 7: Критический разбор

### 1. "Flutter лучший для новичка" — спорно

Dart — нишевый язык. Если проект не взлетит, навык бесполезен. JavaScript универсален (веб, бэкенд, мобайл, n8n). У React Native больше туториалов, ответов на StackOverflow. Когда новичок застрянет — количество доступных ответов критично.

### 2. "FlutterFlow → Flutter" — ловушка

Экспортированный код — нечитаемый boilerplate. Переход от visual builder к ручному коду = переписывание с нуля. Многие разработчики: "Если планируешь кастомить — начинай сразу в коде."

### 3. "Никто не объединяет все фичи — это ниша!" — а может это плохая идея?

Notion, Google, Apple, Flo, Daylio не делают all-in-one потому что:
- UX рассыпается: 8 модулей = перегруженный интерфейс
- Разные аудитории: bullet journal ≠ cycle tracker
- Maintenance hell: 8 модулей = 8 источников багов для соло-разработчика

### 4. "5-6 месяцев до v1.0" — фантазия для новичка

Реалистично: изучение Flutter/Dart (1-2 мес) + state management (2-3 нед) + UI (1 мес) + каждая фича (2-4 нед) + баги/полировка (2-3 мес) + App Store публикация (1-2 нед) = **10-14 месяцев** без AI/виджетов/геймификации.

### 5. "Local-first + PowerSync + Drift + Supabase" — переинженеренно

Три слоя абстракции, каждый может сломаться. Новичок не поймёт — проблема в Drift? PowerSync? Supabase? Сети? **Проще:** чистый SQLite (или localStorage для веба) без sync. Sync — фича v2.0.

### 6. Трекер цикла — юридические и этические риски

- Неточные предсказания → пользователь принимает решения о здоровье на твоих данных → юридический риск
- Health data regulations (GDPR, FTC) — для соло-разработчика разобраться = отдельный проект
- Flo и Clue имеют ML-команды, твой Moving Average объективно хуже

### 7. Монетизация — розовые очки

- 95%+ приложений зарабатывают ноль
- Конкуренты бесплатны (Flo, Clue, Daylio, Habitica)
- App Store: 30% комиссия (15% для малых)
- CAC: $1-5 на пользователя. 1000 юзеров = $1000-5000
- Конверсия в подписку: 2-5%
- Для $1000/мес нужно ~300 платных = ~6000-15000 активных
- Не заложен маркетинговый бюджет и стратегия привлечения

### 8. "Claude Code сгенерирует код" — опасное заблуждение

- Дебаг = 60-80% времени. Claude помогает, но не заменяет понимание
- Собрать 10 packages в работающее приложение — инженерная работа
- Мобильная специфика (permissions, lifecycle, push) — дни отладки каждый пункт

---

## Часть 8: Скорректированный план (после критики)

### Финальная рекомендация

**Скоуп MVP:** 3 экрана (обложка месяца + календарь + задачи). Без трекеров, AI, sync.

**Стек:** React + Vite + Tailwind CSS (уже имеющиеся навыки HTML/CSS/JS).

**Хранение:** localStorage → IndexedDB (Dexie.js). Без бэкенда.

**Мобайл:** PWA сначала → Capacitor (нативная обёртка) или React Native Expo позже.

**Деплой:** Vercel (бесплатно).

### Таймлайн

| Фаза | Срок | Что |
|------|------|-----|
| 0: Обучение | 1-2 нед | React basics, Tailwind |
| 1: Прототип | 1 нед | 3 экрана, хардкод данные, показать Кате |
| 2: MVP | 2-3 нед | CRUD задач, localStorage, галерея обложек, загрузка фото, PWA |
| 3: Полировка | 1-2 нед | Анимации, responsive, тёмная тема |
| 4: Нативное (опционально) | +3-4 нед | Capacitor или React Native Expo |

**Итого до рабочего MVP: 5-8 недель.**

### Что НЕ входит в MVP

| Фича | Почему позже |
|------|-------------|
| Трекер косметики | Отдельное приложение по сложности |
| Трекер привычек | Усложняет UI, v2 |
| Трекер настроения | Можно в v2 (выбор эмодзи на день) |
| Трекер цикла | Юридические риски, сложные алгоритмы |
| Cloud sync | Нет пользователей → нет смысла |
| AI-фичи | Overengineering |
| Рисование на обложках | Сложная canvas-фича |
| Виджеты | Нативный код |
| Подписка | Сначала пользователи |

### Что изучить

1. React — [react.dev/learn](https://react.dev/learn) (1-2 дня с Claude Code)
2. Tailwind CSS — [tailwindcss.com/docs](https://tailwindcss.com/docs)
3. Vite — `npm create vite@latest` (setup за 2 мин)
4. PWA — [web.dev/learn/pwa](https://web.dev/learn/pwa/)

---

## Все источники

### Фреймворки и стеки
- [Flutter vs React Native 2025](https://www.thedroidsonroids.com/blog/flutter-vs-react-native-comparison)
- [React Native vs Flutter 2026](https://www.mobiloud.com/blog/react-native-vs-flutter)
- [Expo New Architecture](https://docs.expo.dev/guides/new-architecture/)
- [PWA vs Native 2026](https://progressier.com/pwa-vs-native-app-comparison-table)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [PWA Performance 2026](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide)

### Backend
- [Firebase vs Supabase vs Appwrite](https://uibakery.io/blog/appwrite-vs-supabase-vs-firebase)
- [Supabase Apple Sign-In](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Appwrite BaaS Guide](https://appwrite.io/blog/post/choosing-the-right-baas-in-2025)

### Базы данных и sync
- [PowerSync + Supabase](https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync)
- [Local-First Flutter](https://dinkomarinac.dev/blog/building-local-first-flutter-apps-with-riverpod-drift-and-powersync/)
- [Drift Flutter Guide](https://dinkomarinac.dev/best-local-database-for-flutter-apps-a-complete-guide)
- [CRDT Libraries 2025](https://velt.dev/blog/best-crdt-libraries-real-time-data-sync)
- [Offline-First Architecture](https://geekyants.com/blog/offline-first-flutter-implementation-blueprint-for-real-world-apps)
- [WatermelonDB](https://github.com/Nozbe/WatermelonDB)
- [Expo Local-First Guide](https://docs.expo.dev/guides/local-first/)

### Open-source проекты
- [BulletJournal](https://github.com/singerdmx/BulletJournal)
- [RocketLog](https://github.com/jessarcher/rocketlog)
- [MERN Bullet Journal](https://github.com/Shysh-Oleksandr/bullet-journal)
- [Vikunja](https://vikunja.io/)
- [AppFlowy](https://appflowy.com/)
- [Loop Habit Tracker](https://github.com/iSoron/uhabits)
- [Habitica](https://github.com/HabitRPG/habitica)
- [Habo (Flutter)](https://github.com/xpavle00/Habo)
- [BeaverHabits](https://github.com/daya0576/beaverhabits)
- [Drip (period tracker)](https://gitlab.com/bloodyhealth/drip)
- [KeepMood](https://github.com/Epse/keepmood)

### Реализация фич
- [rrule.js](https://github.com/jkbrzt/rrule)
- [Nylas — Recurring Events](https://www.nylas.com/blog/calendar-events-rrules/)
- [Expo Calendar SDK](https://docs.expo.dev/versions/latest/sdk/calendar/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Notifee](https://notifee.app/)
- [iOS Widgets in Expo](https://expo.dev/blog/how-to-implement-ios-widgets-in-expo-apps)
- [chrono-node (NLP dates)](https://www.npmjs.com/package/chrono-node)

### Mood/Habit/Cycle
- [Russell Mood Model](https://positivepsychology.com/mood-charts-track-your-mood/)
- [Mood Tracking Experiment](https://www.markwk.com/mood-tracking-experiment.html)
- [Bearable App](https://bearable.app/)
- [Habitica Streaks Wiki](https://habitica.fandom.com/wiki/Streaks)
- [Period Cycle Prediction (arXiv)](https://arxiv.org/abs/2308.07927)
- [Ultrahuman Cycle Algo 2.0](https://blog.ultrahuman.com/blog/cycle-and-ovulation-algo-2-0/)
- [Trophy — Gamification Examples](https://trophy.so/blog/achievements-feature-gamification-examples)

### Privacy & Security
- [SQLCipher](https://www.zetetic.net/sqlcipher/)
- [Health Data Privacy (Stanford Law)](https://law.stanford.edu/2025/02/26/digital-diagnosis-health-data-privacy-in-the-u-s/)
- [HIPAA-GDPR Compliance](https://llif.org/2025/01/31/hipaa-gdpr-compliance-health-apps/)
- [Mental Health App Privacy](https://secureprivacy.ai/blog/mental-health-app-data-privacy-hipaa-gdpr-compliance)

### Монетизация
- [RevenueCat](https://www.revenuecat.com/)
- [RevenueCat State of Subscriptions 2025](https://www.revenuecat.com/state-of-subscription-apps-2025/)
- [Adapty vs RevenueCat](https://adapty.io/compare/revenuecat/)
- [Superwall Expo SDK](https://github.com/superwall/expo-superwall)
- [Paywall Best Practices (Adapty)](https://adapty.io/blog/how-to-design-a-paywall-for-a-mobile-app/)
- [App Monetization 2025](https://getnerdify.com/blog/mobile-app-monetization-strategies)

### UI/UX
- [react-native-calendars](https://github.com/wix/react-native-calendars)
- [react-native-calendar-kit](https://github.com/howljs/react-native-calendar-kit)
- [RN Chart Libraries (LogRocket)](https://blog.logrocket.com/top-react-native-chart-libraries/)
- [RN Animation Libraries 2025](https://www.avidclan.com/blog/build-stunning-mobile-apps-best-react-native-animation-libraries-and-ui-components-to-use-in-2025/)
- [Gluestack UI](https://gluestack.io/)
- [Untitled UI](https://www.untitledui.com/)
- [FlutterFlow Review 2026](https://hackceleration.com/flutterflow-review/)
- [Adalo vs FlutterFlow](https://cybernews.com/ai-tools/adalo-vs-flutterflow/)

### Коммерческие стеки
- [Notion Data Model](https://www.notion.com/blog/data-model-behind-notion)
- [Notion AI Architecture](https://venturebeat.com/ai/to-scale-agentic-ai-notion-tore-down-its-tech-stack-and-started-fresh)
- [Doist Multiplatform](https://www.doist.dev/choosing-a-multiplatform-stack/)
- [Flo + Tecton](https://www.tecton.ai/customers/flo/)
- [Habitica on DEV.to](https://dev.to/opensauced/transforming-productivity-with-open-source-gamification-habitica-ppp)
