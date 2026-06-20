# Roadmap — comments-spa

План доработки проекта до сдачи тестового задания «Комментарии» + рекомендуемые улучшения.

**Статус на старт:** деплой на Render работает, git-репозиторий с осмысленными ветками — готов.

---

## Уровень 1 — обязательно (ТЗ + артефакты сдачи)

Без этих пунктов чек-лист тестового **не закрыт**.

| # | Задача | Ветка | Оценка |
|---|--------|-------|--------|
| 1 | **Таблица top-level** — `<table>` с колонками User Name, E-mail, Date, Text; сортировка по клику на `<th>`; replies каскадом под строкой | `feature/comments-table` | 1.5–2.5 ч |
| 2 | **Preview** — кнопка у textarea, рендер через `sanitizeCommentHtml`, без submit | `feature/comment-preview` | 0.5–1 ч |
| 3 | **OOP** — классы `CommentService`, `CommentRepository`, `CaptchaService` | `refactor/oop-services` | 1.5–2.5 ч |
| 4 | **README.md** — описание, стек, env, Docker, миграции, деплой Render, smoke-test | `docs/readme` | 1–1.5 ч |
| 5 | **Схема БД** — `.mwb` или SQL + ER-диаграмма для MySQL Workbench | `docs/db-schema` | 0.5–1.5 ч |

**Дополнительно:**

- Git overhead (ветка → коммит → merge): **~1–1.5 ч**
- Проверка после каждой ветки (`task verify`, smoke в браузере): **~30–45 мин** на весь цикл

### Итого уровень 1: **~7–10 ч** (~1–1.5 рабочих дня)

---

## Уровень 2 — сильно рекомендуется (формальные дыры ТЗ)

| # | Задача | Ветка | Оценка | Обязательно? | Статус |
|---|--------|-------|--------|--------------|--------|
| 6 | **CAPTCHA regex** — `[a-zA-Z0-9]+` на клиенте и сервере | `feature/captcha-validation` | 0.5 ч | Почти да | ✅ |
| 7 | **IP + User-Agent** в БД | `feature/client-metadata` | 1–1.5 ч | Нет | |

> Username + email уже покрывают формулировку ТЗ про идентификацию клиента. IP/UA — по желанию.

### Итого уровень 2: **+0.5–2 ч**

---

## Уровень 3 — Security hardening (AppSec), базовый

Не требование PDF тестового, но рекомендуется для production и `application_security.md`.

| # | Задача | Ветка | Оценка | Статус |
|---|--------|-------|--------|--------|
| 8 | **Rate limiting** — POST `/comments`, GET `/captcha` | `security/rate-limit` | ~1 ч | ✅ |
| 9 | **Upload hardening** — `multer` fileSize, reject invalid images через `sharp` | `security/upload-hardening` | ~1 ч | ✅ |
| 10 | **Security headers** — `helmet` + nginx (`nosniff`, `X-Frame-Options`, …) | `security/http-headers` | ~45 мин | ✅ |
| 11 | **Ужесточение `href`** — whitelist `http/https/mailto`, блок опасных схем; `validateCommentHtml` + auto `target`/`rel` | `security/xss-href-hardening` | ~45 мин | ✅ |
| 12 | **Безопасные 500** — generic message в production, детали только в лог | `security/error-sanitization` | ~15 мин | ✅ |

> Ветки 10 и 12 можно объединить в одну `security/http-headers`.

### Итого уровень 3 (базовый): **~3–4 ч** — выполнен

---

## Уровень 3b — Security hardening, оставшееся

Критичные и рекомендуемые меры после базового hardening. Подробности — в README → Security.

| # | Задача | Ветка | Оценка | Приоритет |
|---|--------|-------|--------|-----------|
| 13 | **CAPTCHA server-side store** — ответ не в JWT payload (in-memory `Map` + TTL); в токене только `id` | `security/captcha-store` | 1–1.5 ч | Критично |
| 14 | **One-time CAPTCHA** — инвалидировать токен после успешного `POST /comments` | `security/captcha-one-time` | +20–40 мин | Критично |
| 15 | **Whitelist `homePage`** — только `http`/`https` на backend (как для `href` в тексте) | `security/homepage-whitelist` | 30–45 мин | Высокий |
| 16 | **Лимиты полей + GET rate limit** — `.max()` для `text`, `userName`, `email`, `homePage`; rate limit на `GET /api/comments` | `security/input-limits` | 45–60 мин | Высокий |
| 17 | **Re-encode изображений** — всегда сохранять через `sharp.toFile()`, не писать raw buffer | `security/upload-reencode` | 30–45 мин | Средний |

> Пункты 13 и 14 логично делать **в одной ветке** `security/captcha-store` (~1.5–2 ч).

### Итого уровень 3b: **~3.5–4.5 ч** (~полдня)

#### Почему это нужно (кратко)

| # | Проблема сейчас |
|---|-----------------|
| 13 | Ответ CAPTCHA лежит в JWT payload в открытом виде (base64) — обход без решения картинки |
| 14 | Один `captchaId` можно использовать многократно до истечения TTL (3 мин) |
| 15 | `homePage` проходит `z.string().url()` без whitelist схем (`javascript:`, `data:`, …) |
| 16 | Нет верхней границы длины полей; `GET /comments` без rate limit — scraping email |
| 17 | Маленькие изображения (≤ 320×240) сохраняются как raw upload без перекодирования |

---

## Уровень 4 — Unit-тесты (рекомендуется)

Сейчас в проекте нет автотестов; `task verify` — только lint + typecheck. Приоритет — security-критичная логика и сервисный слой.

**Инфраструктура:** Bun test (backend), Vitest (frontend); добавить `test` в `task verify`.

| # | Задача | Ветка | Оценка | Приоритет |
|---|--------|-------|--------|-----------|
| 18 | **Security validators + Zod** — unit-тесты `isAllowedLinkHref`, `validateCommentHtml` (backend + frontend, общие XSS-фикстуры); `createCommentSchema`, `getCommentsQuerySchema`, `commentFormSchema` | `test/security-validators` | 2–3 ч | Высокий |
| 19 | **Services + errorHandler** — `CommentService` и `CaptchaService` с моками repository/captcha; `errorHandler` (400/500, production vs dev) | `test/services-error-handler` | ~2 ч | Высокий |

> Пункт #18 логично делать **первым** — покрывает дублированную логику на клиенте и сервере до рефакторинга CAPTCHA (#13–14).

### Итого уровень 4: **~4–5 ч**

#### Что покрыть (кратко)

| # | Кейсы |
|---|--------|
| 18 | `javascript:` / `data:` / credentials в URL → reject; whitelist `http`/`https`/`mailto`; вложенные теги, незакавыченные атрибуты; CAPTCHA regex; `userName`/`email`/`homePage` |
| 19 | неверная CAPTCHA → `FieldValidationError`; невалидный HTML до записи в БД; санитизация `text`; generic 500 в production; маппинг `ZodError` и `P2003` |

---

## Порядок веток

```
main
 ├── feature/comments-table          ✅
 ├── feature/comment-preview         ✅
 ├── refactor/oop-services           ✅
 ├── feature/captcha-validation      ✅
 ├── security/rate-limit             ✅
 ├── security/upload-hardening       ✅
 ├── security/xss-href-hardening     ✅
 ├── security/http-headers           ✅ (+ error sanitization)
 ├── security/captcha-store          ← следующий ( + one-time, #13–14 )
 ├── security/homepage-whitelist     (#15)
 ├── security/input-limits           (#16)
 ├── security/upload-reencode        (#17)
 ├── test/security-validators        (#18)
 ├── test/services-error-handler     (#19)
 ├── feature/client-metadata         (опционально)
 ├── docs/readme                     ← в конце
 └── docs/db-schema                  ← самый конец
```

README и схема БД — **последними**, когда функционал и модель данных зафиксированы.

---

## Сводная оценка времени

| План | Состав | Время |
|------|--------|-------|
| **Минимум для сдачи ТЗ** | Уровень 1 | ~7–10 ч |
| **ТЗ + формальные дыры** | Уровень 1 + CAPTCHA regex (#6) | ~8–10 ч |
| **Production-ready security** | Уровни 1 + 2 (без #7) + 3 + 3b | ~14–18 ч |
| **Максимум** | Всё включая IP/UA (#7) | ~15–20 ч |
| **Только оставшийся AppSec** | Уровень 3b (#13–17) | ~3.5–4.5 ч |
| **+ Unit-тесты (security + services)** | Уровень 4 (#18–19) | ~4–5 ч |
| **Production-ready + тесты** | Уровни 1 + 2 (без #7) + 3 + 3b + 4 | ~18–23 ч |

---

## Чек-лист после каждой ветки

- [ ] `task verify` (lint + typecheck; после уровня 4 — + `test`)
- [ ] Smoke-test в браузере (форма, CAPTCHA, сортировка, пагинация)
- [ ] Conventional Commit (`feat`, `fix`, `refactor`, `docs`, `security`)
- [ ] Merge в `main` (или PR)

---

## Что не забыть

| Пункт | Зачем |
|-------|--------|
| E-mail в колонке таблицы | Часть задачи «таблица», не только сортировка |
| Preview только через `sanitizeCommentHtml` | Защита от XSS в preview |
| Smoke-test по README | Явное требование PDF: запуск с нуля (`task setup && task dev`) |
| JWT / Query / WebSocket в README | API + Security + раздел «Архитектура frontend» |
| Секция Security в README | Реализованные меры + известные ограничения (CAPTCHA JWT) + ссылка на уровень 3b |
| `prisma migrate deploy` на Render | После изменений схемы БД |

---

## Что не входит в scope (baseline)

- JWT auth пользователей (login/register/refresh)
- Queue (Bull, RabbitMQ)
- Redis / server-side cache
- GraphQL, Elasticsearch, Kafka
- CSRF-токены (нет cookie-based auth)
- Полная XHTML-валидация (достаточно проверки тегов + sanitize)

---

## Уровень 5 — Junior+ (Queue / Cache / Events / JWT) — опционально

Цель: показать понимание инфраструктурных инструментов **без overengineering**. Для проекта «Комментарии» достаточно
одного брокера/очереди и одного кэша, плюс формализация событий и простая JWT-auth зона.

### Минимальный scope для этого проекта

- **Cache-aside (Redis)** для `GET /api/comments` (ключи по `page/sortBy/sortOrder`, TTL, инвалидация на create).
- **Domain events**: событие `comment.created` как единая точка публикации + подписчики (инвалидация кэша, WebSocket).
- **Queue (BullMQ + Redis)**: вынести тяжёлую часть обработки файлов (image verify/resize/re-encode) в worker.
- **JWT auth (минимум)**: защитить admin-операции (например `DELETE /api/comments/:id`) и/или доступ к админ-эндпоинтам.

> Важно: текущий JWT для CAPTCHA (`captchaId`) — это не “auth”. Для уровня Junior+ достаточно отдельного простого auth
> (access token) без refresh-flow.

| # | Задача | Ветка | Оценка | Результат |
|---|--------|-------|--------|-----------|
| 20 | **Domain events** — `comment.created` + единая точка публикации; подписчик WebSocket (`comments:new`) | `junior/events-comment-created` | 2–4 ч | Контроллеры не “знают” о сайд-эффектах |
| 21 | **Redis cache-aside** — `GET /api/comments` с ключами `(page, sortBy, sortOrder)` + TTL 10–60s | `junior/redis-cache-comments` | 3–5 ч | Быстрые повторные чтения |
| 22 | **Cache invalidation** — сброс namespace `comments:list:*` на `comment.created` | `junior/redis-cache-invalidate` | 1–2 ч | Актуальность списка после create |
| 23 | **Queue + worker** — BullMQ; job `comment.attachment.process` | `junior/queue-attachments` | 6–12 ч | POST не блокируется на `sharp`/I/O |
| 24 | **JWT auth (admin)** — middleware `requireAuth`, роли/claim `role=admin`, защищённый эндпоинт | `junior/jwt-admin` | 3–6 ч | Демонстрация JWT в реальном use-case |

### Definition of Done (уровень 5)

- [ ] При создании комментария публикуется `comment.created` (одно место) и обновляется UI через WebSocket
- [ ] `GET /api/comments` отдаёт кэшируемый результат; после create кэш инвалидируется
- [ ] Обработка изображений уходит в worker (очередь); основной API остаётся отзывчивым
- [ ] Есть хотя бы один защищённый JWT-эндпоинт с понятной моделью ролей

---

## Уровень 6 — Middle (Graph / Search / Broker / NoSQL / Cloud) — опционально

Цель: показать проектирование распределённой системы и аргументированный выбор технологий. В реальном тестовом не нужно
внедрять “всё из списка”; достаточно 1–2 осмысленных направлений.

### Варианты осмысленного расширения для «Комментариев»

- **Search (Elasticsearch)**: полнотекстовый поиск по `text/userName/email`, подсветка, фильтры, пагинация.
- **Message broker (RabbitMQ или Kafka)**: event-driven интеграции, ретраи, DLQ, идемпотентность обработчиков.
- **NoSQL (MongoDB)**: хранение “read model” для быстрых списков/дерева replies (CQRS-lite).
- **GraphQL**: единая схема для комментариев/веток, удобные запросы для UI (но нужен контроль N+1).
- **Cloud**: деплой + managed сервисы (Redis/Queue/Search/DB), секреты, observability.

| # | Задача | Ветка | Оценка | Зачем |
|---|--------|-------|--------|------|
| 25 | **Elasticsearch** — индекс комментариев + синхронизация через события | `middle/elasticsearch-search` | 8–16 ч | Поиск и фильтрация как “реальный” кейс |
| 26 | **RabbitMQ/Kafka** — контракт событий `comment.created`, ретраи, DLQ | `middle/message-broker` | 8–20 ч | Надёжная доставка и масштабирование |
| 27 | **GraphQL** — schema + resolvers для дерева replies | `middle/graphql-api` | 8–16 ч | Гибкие запросы клиента |
| 28 | **Cloud** — managed Postgres/Redis/Search + secrets + logs/metrics | `middle/cloud-deploy` | 6–18 ч | Production-ориентированность |

### Definition of Done (уровень 6)

- [ ] Есть чёткая схема событий/контрактов (versioning, idempotency, retries)
- [ ] Выбран один “сложный” инструмент (Search/Broker/GraphQL/NoSQL) и он решает конкретный use-case
- [ ] Архитектура описана в README: trade-offs, масштабирование, стоимость, риски

---

## Уровень 7 — Middle+ (масштабирование 1M сообщений / 100k пользователей в сутки)

Вводные: система должна выдерживать **1 000 000 сообщений** и **~100k пользователей за 24ч**. Типичный профиль — read-heavy
(лента/таблица, пагинация, сортировки) с постоянным потоком writes (новые комментарии + вложения).

Цель уровня: заложить масштабируемую архитектуру (без “внедрить всё”), описать trade-offs и подтвердить гипотезы
**нагрузочным тестом**.

### Архитектурные изменения (high level)

- **DB (Postgres)**:
  - добавить/проверить индексы под реальные запросы: `(parentId, createdAt)`, `createdAt`, `email`, `userName`
  - рассмотреть **keyset pagination** (cursor-based) вместо `OFFSET` для больших страниц и высокой нагрузки
  - обеспечить стабильный порядок сортировки (например tie-breaker по `id`)
- **Read model / CQRS-lite**:
  - отделить “read path” (списки top-level + replies) от “write path”
  - опционально хранить денормализованный read model в Redis/Mongo (если Postgres не тянет дерево replies)
- **Cache (Redis)**:
  - кэшировать страницы `GET /api/comments` (cache-aside), TTL + versioned keys
  - защита от stampede (single-flight/lock на ключ) для горячих ключей (page=1)
  - инвалидация через доменные события `comment.created` (namespace invalidation)
- **Async pipeline (Queue + worker)**:
  - вынести тяжёлую обработку вложений (resize/re-encode/antivirus placeholder) в очередь
  - идемпотентность job’ов, retry policy, DLQ
- **Events / Message broker**:
  - формальный контракт событий: `comment.created`, `comment.attachment.processed`
  - для production: RabbitMQ (routing + DLQ) или Kafka (stream + replay) — выбор объяснить в README
- **Real-time**:
  - Socket.IO при росте требует scale-out: sticky sessions + shared adapter (Redis) или переход на broker-based fanout
  - стратегия для “1M сообщений”: не пушить “всем всё”, а пушить событие “invalidate list”/“new id” и давать клиенту re-fetch
- **Uploads**:
  - локальная папка `/uploads` не подходит при масштабировании → object storage (S3/GCS/или аналог) + CDN
- **Observability**:
  - корреляционный id (request id) в логах; метрики p95/p99; алерты на рост ошибок/latency

### Нагрузочный тест (обязательно)

Инструмент: `k6` (предпочтительно) или `artillery`. Тест должен моделировать read-heavy нагрузку:

- **Сценарии**:
  - `browse_comments`: 70–90% — `GET /api/comments?page=1..N&sortBy=createdAt&sortOrder=desc`
  - `create_comment`: 10–30% — `POST /api/comments` (с/без файла; отдельный сценарий на image upload)
  - `websocket_connect`: отдельный тест на количество одновременных WS-коннектов (без “спама” сообщений)
- **Метрики и пороги (пример)**:
  - `GET /api/comments`: p95 < 300–500ms, error rate < 1%
  - `POST /api/comments`: p95 < 800–1500ms (если файл синхронный), либо < 300–600ms (если файл async через queue)
  - DB: стабильные времена запросов; отсутствие лавинообразного роста CPU/IO
- **Данные**:
  - прогреть базу до 1M сообщений (скриптом/seed) или хотя бы до 100k для локального прогона
  - фиксировать конфиг окружения (локально Docker vs staging)

| # | Задача | Ветка | Оценка | Результат |
|---|--------|-------|--------|-----------|
| 29 | **DB perf baseline** — индексы + замеры SQL/Prisma запросов для `GET /comments` | `middleplus/db-perf` | 3–6 ч | Понятные bottlenecks и план |
| 30 | **Keyset pagination** (опционально) — cursor-based вместо offset | `middleplus/keyset-pagination` | 4–10 ч | Стабильный latency на больших данных |
| 31 | **Redis caching hardening** — stampede protection + versioned keys | `middleplus/redis-cache-hardening` | 3–6 ч | Предсказуемая работа hot keys |
| 32 | **WebSocket scale plan** — sticky + adapter или broker fanout | `middleplus/realtime-scale` | 2–4 ч | Масштабируемый realtime |
| 33 | **Load test** — k6 сценарии + thresholds + отчёт | `middleplus/load-test` | 4–10 ч | Воспроизводимая нагрузка + выводы |

### Definition of Done (уровень 7)

- [ ] Есть документированная архитектура под 1M/100k: DB+cache+async+events+realtime+uploads
- [ ] Есть воспроизводимый нагрузочный тест (скрипт + параметры + пороги)
- [ ] Есть отчёт по результатам (что упирается, что улучшили, следующий шаг)

---

## Уже реализовано (не требует отдельной ветки)

- [x] Express + Prisma (PostgreSQL) + React
- [x] Форма: User Name, Email, Homepage, CAPTCHA, Text
- [x] Каскадные replies, пагинация 25, сортировка LIFO по умолчанию
- [x] XSS: `sanitize-html` (backend) + DOMPurify (frontend); `validateCommentHtml` (whitelist тегов/атрибутов)
- [x] SQL injection: Prisma ORM, без raw queries
- [x] Upload: JPG/GIF/PNG/TXT, resize 320×240, TXT ≤ 100 KB; проверка через `sharp`
- [x] Ссылки в тексте: whitelist `http`/`https`/`mailto`; auto `target="_blank"` + `rel="noopener noreferrer"`
- [x] Rate limiting: POST `/api/comments` (10/мин), GET `/api/captcha` (30/мин)
- [x] Security headers: `helmet` + nginx (`nosniff`, `X-Frame-Options`, `Referrer-Policy`)
- [x] CAPTCHA regex `[a-zA-Z0-9]+` на клиенте и сервере
- [x] Generic 500 в production (`errorHandler`)
- [x] Lightbox для изображений
- [x] HTML toolbar `[i]`, `[strong]`, `[code]`, `[a]`
- [x] WebSocket (real-time обновление списка)
- [x] Docker + деплой Render
- [x] Git-репозиторий
- [x] Taskfile + docker-compose (локальный Postgres, `task setup`, `task verify`)

---

## Definition of Done (готовность к сдаче)

- [x] Top-level комментарии отображаются в `<table>` с сортируемыми заголовками
- [x] Preview работает без перезагрузки страницы
- [x] Backend использует OOP-классы для сервисов/репозиториев
- [x] README позволяет поднять проект с нуля
- [ ] Схема БД приложена и соответствует Prisma-модели
- [x] (Рекомендуется) CAPTCHA regex + базовый security hardening (уровень 3)
- [ ] (Рекомендуется) Оставшийся AppSec: CAPTCHA store, one-time token, лимиты полей (уровень 3b) — см. [ниже](#уровень-3b--security-hardening-оставшееся)
- [ ] (Рекомендуется) Unit-тесты security validators, Zod-схем и сервисов (уровень 4)
- [ ] Smoke-test пройден локально и на Render
