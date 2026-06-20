# AGENTS.md

Project-level instructions for AI coding agents working in this repository.
This file is the cross-tool source of truth (Cursor, Copilot, Codex, etc.).
Code-style rules scoped by file type live in `.cursor/rules/*.mdc`.

## Project Overview

Comments SPA — a single-page app for posting and viewing comments with cascading
replies, CAPTCHA, file uploads, and real-time list updates over WebSocket.

It is a **Bun workspaces monorepo** with two packages:

- `frontend/` — React 19 SPA (Vite, TanStack Query, Tailwind, shadcn/ui)
- `backend/` — Express 5 API (Bun, Prisma, PostgreSQL, Socket.IO)

## Tech Stack

| Layer          | Technologies                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Frontend       | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui, DOMPurify, Socket.IO client |
| Backend        | Express 5, TypeScript, Bun, Prisma ORM, PostgreSQL, Socket.IO, sanitize-html, sharp, multer, svg-captcha, JWT |
| Infrastructure | Docker, nginx, docker-compose, Taskfile, Render Blueprint                                       |
| Tooling        | Bun 1.3+ (package manager), Biome (lint/format), Husky + lint-staged, jscpd                      |

## Setup & Commands

Use `task` (Taskfile) as the primary entrypoint. Bun is the package manager — do
not use `npm`, `yarn`, or `pnpm`.

```bash
task setup        # first-time setup: .env, deps, Postgres, migrations
task dev          # run frontend (:5173) + backend (:3000) in parallel
task verify       # lint + typecheck — REQUIRED before finishing any change
task build        # production build of both packages
task db:seed      # seed 100 top-level comments
task db:migrate   # apply Prisma migrations (dev)
task db:generate  # regenerate Prisma client after schema changes
task --list       # full task list
```

Underlying scripts (if `task` is unavailable): `bun run lint`,
`bun run typecheck`, `bun run check` (Biome `check --write`), `bun install`.

## Verification (required)

After any code change, always run:

```bash
task verify
```

This runs `biome lint .` and `bun --filter '*' typecheck`. There are **no unit or
e2e tests** in this project — verify behavior manually in the browser (see the
Smoke-test checklist in `README.md`). A pre-commit hook (lint-staged) runs Biome
and jscpd on staged files.

## Architecture

### Backend — strict layered architecture

```
Routing → Controllers → Services → Repositories → Prisma
```

- Folders: `backend/src/{routes,controllers,services,repositories,middlewares,schemas,lib,types}`.
- OOP service classes: `CommentService`, `CommentRepository`, `CaptchaService`, `WebsocketService`.
- Input validation uses **Zod** schemas (`backend/src/schemas`) via validation middleware.
- Creating a comment emits a `comments:new` Socket.IO event.
- Errors are forwarded to the centralized error-handling middleware
  (`backend/src/middlewares/errorHandler.ts`) — never swallow errors silently.

### Frontend — Feature-Sliced Design (FSD)

```
frontend/src/{app,widgets,features,entities,shared}
```

- Comment list is cached with TanStack Query (`useCommentsQuery`, keys in
  `commentQueryKeys`). Mutations and the WebSocket `comments:new` event both call
  `invalidateQueries`. Real-time subscription: `useCommentSocket`.
- Forms use `react-hook-form` + Zod; do not build forms from many manual `useState`.
- Local sub-components live inside their feature slice, not the global `shared/ui`.

## API

| Method | Path                                       | Description                              |
| ------ | ------------------------------------------ | ---------------------------------------- |
| `GET`  | `/api/captcha`                             | SVG CAPTCHA + signed JWT `captchaId`     |
| `GET`  | `/api/comments?page=&sortBy=&sortOrder=`   | Paginated top-level comments (25/page)   |
| `POST` | `/api/comments`                            | Create comment (`multipart/form-data`)   |
| `GET`  | `/health`                                  | Health check                             |

## Conventions

- **Language:** all identifiers, comments, and commit messages in English.
- **TypeScript:** strict — no `any` (use `unknown`); avoid `as` casts (prefer type
  guards); explicit return types on exported functions; `interface` for models.
- **Comments:** explain *why*, not *what*. Simple code needs no comments.
- **File size:** keep files focused (~250 lines max); use early returns over deep nesting.
- **Imports:** prefer absolute aliases (`@/...`); order third-party → internal → local.
- **Commits:** Conventional Commits, imperative mood, lowercase, no trailing period.
  Example: `feat(api): add rate limiter to comment creation`.

## Security (must preserve)

- **XSS:** sanitize all rich text — `sanitize-html` (backend) + DOMPurify (frontend).
  Allowed tags: `a`, `code`, `i`, `strong`. `href` limited to `http`/`https`/`mailto`;
  links get `target="_blank"` + `rel="noopener noreferrer"`. See `validateCommentHtml`.
- **SQL injection:** use Prisma only — no raw queries.
- **Uploads:** MIME/extension whitelist; TXT ≤ 100 KB; images ≤ 5 MB, validated and
  resized to 320×240 via `sharp`.
- **CAPTCHA:** JWT-signed (3 min TTL, `JWT_SECRET`); answer must match `[a-zA-Z0-9]+`.
- **Rate limiting:** `express-rate-limit` — `GET /api/captcha` 30/min, `POST /api/comments` 10/min per IP.
- **Secrets:** never hardcode credentials; never commit `.env`. Use `process.env`
  and keep `.env.example` up to date.

## Project Structure

```
comments-spa/
├── backend/          # Express API, Prisma, uploads
├── frontend/         # React SPA (Vite)
├── docker/           # nginx template, start.sh
├── docs/             # ROADMAP, DB schema
├── .cursor/rules/    # file-scoped code-style rules (Cursor)
├── docker-compose.yml
├── Dockerfile
├── render.yaml
└── Taskfile.yml
```

## Reference Docs

- `README.md` — full setup, env vars, DB model, smoke-test, deploy guide.
- `docs/ROADMAP.md` — planned work, including remaining security hardening (level 3b).
