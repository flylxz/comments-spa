#!/bin/sh
set -e

export PORT="${PORT:-10000}"

envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

bunx prisma migrate deploy

PORT=3000 bun dist/app.js &

exec nginx -g 'daemon off;'
