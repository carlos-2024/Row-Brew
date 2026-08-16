#!/bin/sh
set -e

echo "🐕 Roa Brew — iniciando contenedor…"

if [ -n "$DATABASE_URL" ]; then
  echo "→ Sincronizando esquema de base de datos…"
  ./node_modules/.bin/prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss || \
    echo "⚠️  No se pudo sincronizar el esquema (¿la base ya está lista?). Continuando…"

  # Carga la carta en el primer despliegue. El seed es idempotente y nunca
  # pisa la contraseña de un admin existente, así que dejarlo activo no rompe
  # nada; aun así conviene apagarlo una vez que la carta ya esté cargada.
  if [ "$SEED_ON_START" = "true" ]; then
    echo "→ Cargando la carta (SEED_ON_START=true)…"
    node --experimental-strip-types prisma/seed.ts || \
      echo "⚠️  El seed falló. Puedes correrlo a mano desde la consola del servicio."
  fi
else
  echo "⚠️  DATABASE_URL no está definida. La app arrancará pero fallará al leer datos."
fi

echo "→ Listo. Levantando Next.js en el puerto ${PORT:-3000}"
exec "$@"
