# Comments SPA

Одностраничное приложение для публикации и просмотра комментариев с каскадными ответами, CAPTCHA, загрузкой файлов и real-time обновлением списка.

**Live demo:** деплой на [Render](https://render.com) (см. раздел [Деплой на Render](#деплой-на-render)).

### Статус

| Область | Состояние |
| ------- | --------- |
| ТЗ + артефакты сдачи (уровень 1) | ✅ список, preview, OOP, README, [`docs/db-schema/`](docs/db-schema/README.md) (`.mwb`, SQL, ER) |
| Security hardening (уровни 3–3b) | ✅ rate limit, upload, headers, XSS, CAPTCHA store/one-time, лимиты полей; ⚠️ re-encode изображений (#17) — частично |
| Smoke-test (чек-лист ниже) | ⬜ |
| Unit-тесты (уровень 4) | ⬜ |

Подробный план — [docs/ROADMAP.md](docs/ROADMAP.md).

---

## Стек

| Слой           | Технологии                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui, DOMPurify, Socket.IO client              |
| Backend        | Express 5, TypeScript, Bun, Prisma ORM, PostgreSQL, Socket.IO, sanitize-html, sharp, multer, svg-captcha, JWT |
| Shared         | `@comments-spa/shared` — типы API, Zod-схемы, валидаторы HTML/upload, политика sanitization                   |
| Инфраструктура | Docker, nginx, docker-compose, Taskfile, Render Blueprint                                                     |

---

## Требования

- [Bun](https://bun.sh) **1.3+** (указан в `packageManager`)
- [Docker](https://www.docker.com/) и Docker Compose — для локального PostgreSQL
- [Task](https://taskfile.dev) — обёртка над скриптами проекта

---

## Быстрый старт

```bash
git clone <repository-url>
cd comments-spa

task setup   # .env, зависимости, Postgres, миграции
task dev     # frontend :5173 + backend :3000
```

Откройте [http://localhost:5173](http://localhost:5173).

Vite проксирует `/api`, `/uploads` и `/socket.io` на backend (`frontend/vite.config.ts`).

Перед `task dev` и `task build` пакет `@comments-spa/shared` собирается в `dist/` (`tsc`).
При изменении файлов в `packages/shared/` пересоберите: `bun --filter @comments-spa/shared build`.

### Опционально: тестовые данные

```bash
task db:seed   # 100 top-level комментариев
```

---

## Переменные окружения

Task `env` копирует `.env.example` → `.env`, если файлов ещё нет.

### Backend (`backend/.env`)

| Переменная     | Описание                          | Пример                                                                 |
| -------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string      | `postgresql://user:password@localhost:5432/comments_spa?schema=public` |
| `PORT`         | Порт Express (локально)           | `3000`                                                                 |
| `JWT_SECRET`   | Секрет для подписи CAPTCHA-токена | `your-secret-key-change-in-production`                                 |

### Frontend (`frontend/.env`)

| Переменная        | Описание                                      | Пример                      |
| ----------------- | --------------------------------------------- | --------------------------- |
| `VITE_API_URL`    | Базовый URL API                               | `http://localhost:3000/api` |
| `VITE_API_ORIGIN` | Origin для статики `/uploads/*` (опционально) | `http://localhost:3000`     |

В production-сборке Docker `VITE_API_URL=/api` — относительный путь через nginx.

---

## База данных и миграции

Локальный PostgreSQL поднимается через `docker-compose.yml`:

```bash
task db:up        # запустить Postgres
task db:migrate   # prisma migrate dev
task db:down      # остановить
task db:reset     # остановить и удалить volume
```

Схема описана в `backend/prisma/schema.prisma`. Миграции лежат в `backend/prisma/migrations/`.
Артефакты для сдачи (`.mwb`, SQL, ER): [`docs/db-schema/`](docs/db-schema/README.md).

### Модель `Comment`

| Поле        | Тип      | Описание                                             |
| ----------- | -------- | ---------------------------------------------------- |
| `id`        | Int      | PK, autoincrement                                    |
| `userName`  | String   | Имя пользователя                                     |
| `email`     | String   | E-mail                                               |
| `homePage`  | String?  | Homepage URL                                         |
| `text`      | String   | HTML-текст комментария (sanitized)                   |
| `fileUrl`   | String?  | Путь к загруженному файлу                            |
| `fileName`  | String?  | Оригинальное имя файла                               |
| `fileSize`  | Int?     | Размер файла в байтах                                |
| `createdAt` | DateTime | Дата создания                                        |
| `parentId`  | Int?     | FK на родительский комментарий (`ON DELETE CASCADE`) |

---

## Taskfile — основные команды

```bash
task setup          # первичная настройка
task dev            # dev-серверы frontend + backend
task verify         # lint + typecheck
task build          # production-сборка
task db:seed        # наполнить БД тестовыми комментариями
task docker:build   # собрать Docker-образ
task docker:run     # запустить контейнер локально (нужен DATABASE_URL)
```

Полный список: `task --list`.

---

## Docker (production-образ)

Многостадийный `Dockerfile` собирает frontend (Vite), backend (tsc) и запускает nginx + Express в одном контейнере.

```bash
task docker:build
task docker:run   # порт 10000, env из backend/.env
```

При старте контейнера (`docker/start.sh`):

1. nginx слушает `$PORT` (по умолчанию `10000`)
2. `prisma migrate deploy` применяет миграции
3. Express слушает `3000` внутри контейнера

Health-check: `GET /health`.

---

## Деплой на Render

В репозитории есть [`render.yaml`](render.yaml) — Blueprint для Render:

- **Web service** — Docker runtime, free tier, region Frankfurt
- **PostgreSQL** — managed database, `DATABASE_URL` пробрасывается автоматически
- `JWT_SECRET` генерируется Render
- `prisma migrate deploy` выполняется при каждом старте контейнера

### Шаги

1. Форк / push репозитория на GitHub
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → выбрать репозиторий
3. Render создаст web service и Postgres по `render.yaml`
4. Дождаться успешного деплоя; проверить `https://<your-app>.onrender.com/health`

### Ограничения free tier

- Web service засыпает после ~15 мин без активности (cold start ~30–60 с)
- Postgres на free tier истекает через 90 дней без апгрейда
- Загруженные файлы **не персистентны** — при редеплое `/uploads` очищается

---

## Smoke-test

Проверка после `task setup && task dev` или после деплоя на Render.

### Локально

- [ ] [http://localhost:5173](http://localhost:5173) открывается
- [ ] [http://localhost:3000/health](http://localhost:3000/health) → `{"status":"ok"}`
- [ ] CAPTCHA отображается и обновляется
- [ ] Отправка комментария с валидными полями — комментарий появляется в списке
- [ ] Reply под существующим комментарием отображается каскадом
- [ ] Сортировка top-level (`CommentsSortBar`: User Name, E-mail, Date)
- [ ] Пагинация (25 записей на страницу)
- [ ] Preview — рендер без submit
- [ ] Загрузка JPG/GIF/PNG (resize до 320×240) и TXT (≤ 100 KB)
- [ ] HTML toolbar: `[i]`, `[strong]`, `[code]`, `[a]`
- [ ] Lightbox для изображений
- [ ] Real-time: второй вкладкой — новый комментарий появляется без reload

### Качество кода

```bash
task verify
```

---

## API

| Метод  | Путь                                     | Описание                                     |
| ------ | ---------------------------------------- | -------------------------------------------- |
| `GET`  | `/api/captcha`                           | SVG CAPTCHA + JWT `captchaId`                |
| `GET`  | `/api/comments?page=&sortBy=&sortOrder=` | Пагинированный список top-level комментариев |
| `POST` | `/api/comments`                          | Создание комментария (multipart/form-data)   |
| `GET`  | `/health`                                | Health-check                                 |

Query-параметры `GET /comments`: `page` (default 1), `sortBy` (`userName` \| `email` \| `createdAt`), `sortOrder` (`asc` \| `desc`).

**CAPTCHA:** `GET /api/captcha` возвращает SVG и подписанный JWT `captchaId` (TTL 3 мин). В JWT только `id`; ответ хранится server-side в in-memory store. При `POST /api/comments` `CaptchaService.verifyCaptcha()` сверяет ответ с store; после успешного создания комментария токен инвалидируется (one-time). Ответ должен совпадать с `[a-zA-Z0-9]+`.

---

## Архитектура backend

```
Routing → Controllers → Services → Repositories → Prisma
```

OOP-классы: `CommentService`, `CommentRepository`, `CaptchaService`. При создании комментария эмитится событие `comments:new` через Socket.IO.

---

## Архитектура frontend

Список комментариев кешируется через TanStack Query (`useCommentsQuery`, ключи `commentQueryKeys`). После создания комментария mutation инвалидирует кеш; WebSocket-событие также вызывает `invalidateQueries`. Real-time подписка — `useCommentSocket`.

---

## Security

### Реализовано

| Угроза          | Мера                                                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| XSS             | `sanitize-html` (backend) + DOMPurify (frontend); политика тегов/схем в `@comments-spa/shared`; `validateCommentHtml`; `href` только `http`/`https`/`mailto`; auto `target="_blank"` + `rel="noopener noreferrer"` |
| SQL injection   | Prisma ORM, без raw queries                                                                                                                                                                                        |
| Upload abuse    | Whitelist MIME/расширений из shared; TXT ≤ 100 KB; изображения ≤ 5 MB; валидация через `sharp`, resize до 320×240                                                                                                  |
| CAPTCHA         | JWT-подпись (TTL 3 мин, `JWT_SECRET`); ответ в server-side store (не в payload); one-time после успешного POST; regex `[a-zA-Z0-9]+`; rate limit 30/мин на `/api/captcha`                                          |
| Валидация ввода | Zod в `@comments-spa/shared` + клиентские расширения на frontend; `userName` и `captchaAnswer` — `[a-zA-Z0-9]+`; `.max()` для `text`, `userName`, `email`, `homePage` (`fieldSchemas.ts`)                          |
| homePage        | Whitelist схем `http`/`https` на backend (как для `href` в тексте)                                                                                                                                                 |
| Rate limiting   | `express-rate-limit`: GET `/api/captcha` — 30/мин, POST `/api/comments` — 10/мин, GET `/api/comments` — 60/мин на IP                                                                                               |
| HTTP headers    | `helmet` на Express; nginx: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`                                                                                                                         |
| Error leakage   | В production 5xx возвращают generic message; детали только в server logs                                                                                                                                           |

### Известные ограничения (уровень 3b)

Подробный план — [docs/ROADMAP.md](docs/ROADMAP.md#уровень-3b--security-hardening-оставшееся).

| Угроза                    | Статус                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Upload (defense in depth) | ⚠️ Изображения ≤ 320×240 сохраняются как raw buffer; планируется re-encode через `sharp.toFile()` (#17) |

---

## Структура проекта

```
comments-spa/
├── backend/          # Express API, Prisma, uploads
├── frontend/         # React SPA (Vite)
├── packages/
│   └── shared/       # @comments-spa/shared — типы, константы, Zod, валидаторы
├── docker/           # nginx template, start.sh
├── docs/             # ROADMAP, docs/db-schema/ (.mwb, SQL, ER)
├── tsconfig.base.json
├── docker-compose.yml
├── Dockerfile
├── render.yaml
├── Taskfile.yml
└── README.md
```

---

## Лицензия

Учебный / тестовый проект.
