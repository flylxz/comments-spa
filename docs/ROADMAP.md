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

| # | Задача | Ветка | Оценка | Обязательно? |
|---|--------|-------|--------|--------------|
| 6 | **CAPTCHA regex** — `[a-zA-Z0-9]+` на клиенте и сервере | `feature/captcha-validation` | 0.5 ч | Почти да |
| 7 | **IP + User-Agent** в БД | `feature/client-metadata` | 1–1.5 ч | Нет |

> Username + email уже покрывают формулировку ТЗ про идентификацию клиента. IP/UA — по желанию.

### Итого уровень 2: **+0.5–2 ч**

---

## Уровень 3 — Security hardening (AppSec)

Не требование PDF тестового, но рекомендуется для production и `application_security.md`.

| # | Задача | Ветка | Оценка |
|---|--------|-------|--------|
| 8 | **Rate limiting** — POST `/comments`, GET `/captcha` | `security/rate-limit` | ~1 ч |
| 9 | **Upload hardening** — `multer` fileSize, reject invalid images через `sharp` | `security/upload-hardening` | ~1 ч |
| 10 | **Security headers** — `helmet` + nginx (`nosniff`, `X-Frame-Options`, …) | `security/http-headers` | ~45 мин |
| 11 | **Ужесточение `href`** — whitelist `http/https/mailto`, блок опасных схем | `security/xss-href-hardening` | ~45 мин |
| 12 | **Безопасные 500** — generic message в production, детали только в лог | `security/error-sanitization` | ~15 мин |

> Ветки 10 и 12 можно объединить в одну `security/http-headers`.

### Итого уровень 3: **~3–4 ч**

---

## Порядок веток

```
main
 ├── feature/comments-table
 ├── feature/comment-preview
 ├── refactor/oop-services
 ├── feature/captcha-validation
 ├── security/rate-limit
 ├── security/upload-hardening
 ├── security/xss-href-hardening
 ├── security/http-headers          (+ error sanitization)
 ├── feature/client-metadata        (опционально)
 ├── docs/readme                    ← в конце
 └── docs/db-schema                 ← самый конец
```

README и схема БД — **последними**, когда функционал и модель данных зафиксированы.

---

## Сводная оценка времени

| План | Состав | Время |
|------|--------|-------|
| **Минимум для сдачи ТЗ** | Уровень 1 | ~7–10 ч |
| **ТЗ + формальные дыры** | Уровень 1 + CAPTCHA regex | ~8–10 ч |
| **Полный план (без IP/UA)** | Уровни 1 + 2 (без #7) + 3 | ~11–14 ч |
| **Максимум** | Всё включая IP/UA | ~12–16 ч |

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
| Секция Junior+ в README | JWT для CAPTCHA, TanStack Query cache, WebSocket events |
| Секция Security в README | XSS, rate limit, upload limits (после уровня 3) |
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
- [x] XSS: `sanitize-html` (backend) + DOMPurify (frontend)
- [x] SQL injection: Prisma ORM, без raw queries
- [x] Upload: JPG/GIF/PNG/TXT, resize 320×240, TXT ≤ 100 KB
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
- [ ] README позволяет поднять проект с нуля
- [ ] Схема БД приложена и соответствует Prisma-модели
- [ ] (Рекомендуется) CAPTCHA regex + security hardening
- [ ] Smoke-test пройден локально и на Render
