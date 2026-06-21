FROM oven/bun:1.3 AS frontend-build

WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile --filter comments-spa-frontend

COPY frontend ./frontend
COPY packages/shared ./packages/shared

ENV VITE_API_URL=/api

WORKDIR /app/frontend
RUN bun run build

FROM oven/bun:1.3 AS backend-deps

WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/shared/package.json ./packages/shared/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/

RUN bun install --frozen-lockfile --production --filter comments-spa-backend

FROM oven/bun:1.3 AS backend-build

WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/shared/package.json ./packages/shared/
COPY backend/prisma ./backend/prisma
COPY backend/prisma.config.ts ./backend/

RUN bun install --frozen-lockfile --filter comments-spa-backend

COPY backend ./backend
COPY packages/shared ./packages/shared

WORKDIR /app/backend
RUN bun run build

FROM oven/bun:1.3 AS runner

WORKDIR /app/backend

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext-base \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/cache/nginx /var/log/nginx /run/nginx

COPY --from=backend-deps /app/node_modules /app/node_modules
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/packages/shared /app/packages/shared
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=backend-build /app/backend/prisma ./prisma
COPY --from=backend-build /app/backend/prisma.config.ts ./prisma.config.ts
COPY --from=backend-build /app/backend/src/generated ./src/generated
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/start.sh /start.sh

RUN chmod +x /start.sh \
  && mkdir -p uploads \
  && rm -f /etc/nginx/sites-enabled/default

EXPOSE 10000

CMD ["/start.sh"]
