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

---

## Чек-лист после каждой ветки

- [ ] `task verify` (lint + typecheck)
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

## Что не входит в scope

- JWT auth пользователей (login/register/refresh)
- Queue (Bull, RabbitMQ)
- Redis / server-side cache
- GraphQL, Elasticsearch, Kafka
- CSRF-токены (нет cookie-based auth)
- Полная XHTML-валидация (достаточно проверки тегов + sanitize)

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
- [ ] Smoke-test пройден локально и на Render
