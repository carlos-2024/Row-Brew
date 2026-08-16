#!/bin/sh
set -e

echo "🐕 Roa Brew — iniciando contenedor…"

if [ -n "$DATABASE_URL" ]; then
  echo "→ Sincronizando esquema de base de datos…"
  ./node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss || \
    echo "⚠️  No se pudo sincronizar el esquema (¿la base ya está lista?). Continuando…"
else
  echo "⚠️  DATABASE_URL no está definida. La app arrancará pero fallará al leer datos."
fi

echo "→ Listo. Levantando Next.js en el puerto ${PORT:-3000}"
exec "$@"
