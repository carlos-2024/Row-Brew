#!/bin/sh
set -e

echo "🐕 Roa Brew — iniciando contenedor…"

if [ -n "$DATABASE_URL" ]; then
  echo "→ Sincronizando esquema de base de datos…"
  # Se invoca el bundle directamente y NO node_modules/.bin/prisma: ese es un
  # symlink y Docker lo copia como archivo real, con lo que __dirname deja de
  # apuntar a build/ y el CLI no encuentra su prisma_schema_build_bg.wasm.
  #
  # Sin --accept-data-loss a propósito: si un cambio de esquema implicara
  # perder datos, Prisma se niega y el arranque sigue con el esquema anterior.
  # Preferimos un despliegue que avisa a uno que borra en silencio.
  node ./node_modules/prisma/build/index.js db push \
    --schema=./prisma/schema.prisma --skip-generate || {
    echo "⚠️  No se pudo sincronizar el esquema."
    echo "   Causas típicas: DATABASE_URL incorrecta, o un cambio que"
    echo "   destruiría datos existentes. NADA se borró. Revisa los logs de"
    echo "   arriba y aplica el cambio a mano si de verdad lo quieres."
  }

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
echo "   (si ese puerto no coincide con el configurado en EasyPanel, el sitio no cargará)"
exec "$@"
