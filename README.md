# 🧋 Roa Brew — Sistema web

Sitio público + pedidos por WhatsApp + panel administrativo para **Roa Brew**
(té, matcha y cold brew — Los Olivos, Lima).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · PostgreSQL · Docker

---

## Qué incluye

### Sitio público
| Ruta | Qué es |
|---|---|
| `/` | Landing animada: hero, propuesta, las 4 familias, promos, favoritos, experiencia y contacto |
| `/carta` | Carta completa con buscador, filtro por categoría, extras y carrito |
| `/pedido/[code]` | Ticket de confirmación del pedido |

- Carrito persistente en `localStorage` con extras (tapioca, popping boba…).
- Al confirmar, el pedido **se guarda en la base** y se abre WhatsApp con el mensaje ya escrito.
- Cada bebida sin foto se dibuja sola: `CupArt` genera el vaso con las capas de color
  según el nombre (mango → naranja, fresa → rosado, taro → morado…) y la categoría.

### Panel admin (`/admin`)
| Ruta | Qué hace |
|---|---|
| `/admin` | Pedidos de hoy, pendientes, ventas del mes, ranking de lo más pedido |
| `/admin/pedidos` | Lista filtrable por estado, cambio de estado, link directo al WhatsApp del cliente |
| `/admin/productos` | CRUD de bebidas con vista previa en vivo |
| `/admin/categorias` | CRUD de familias + tema visual de cada una |
| `/admin/promos` | CRUD de promos (2x20, 2x22, 2x25…) |
| `/admin/ajustes` | Textos del hero, contacto, horario, moneda y extras |

Sesión con JWT en cookie `httpOnly` (`jose`), contraseñas con `bcrypt`, rutas
protegidas por middleware.

---

## Desarrollo local

```bash
npm install
```

Copia `.env.example` a `.env` y apunta `DATABASE_URL` a tu Postgres. Luego:

```bash
npm run db:setup
```

Ese comando crea las tablas y carga la carta completa (42 bebidas, 5 promos, 4 extras)
más el usuario admin. Después:

```bash
npm run dev
```

Sitio en http://localhost:3000 · panel en http://localhost:3000/admin

**Credenciales iniciales:** las de `ADMIN_EMAIL` / `ADMIN_PASSWORD` en tu `.env`.
Si no defines `ADMIN_PASSWORD`, el seed **genera una contraseña aleatoria y la
imprime una sola vez** — cópiala de la consola. No hay contraseña por defecto a
propósito: este repositorio es público.

Volver a correr el seed nunca pisa la contraseña de un admin que ya existe.

### Con Docker Compose (levanta también el Postgres)

```bash
docker compose up --build
```

Luego, una sola vez, carga la carta:

```bash
docker compose exec web ./node_modules/.bin/prisma db seed
```

---

## Despliegue en EasyPanel

### 1. Crear el Postgres

En tu proyecto de EasyPanel → **+ Service → Postgres**.
Ponle de nombre `roabrew-db`, guarda la contraseña y copia la **Connection URL interna**
(la que usa el hostname del servicio, no `localhost`).

### 2. Crear la app

**+ Service → App**, nombre `roabrew`.

- **Source:** conecta el repositorio de Git donde subiste esta carpeta.
- **Build:** elige **Dockerfile** (el `Dockerfile` de la raíz ya está listo).
- **Port:** `3000`.

### 3. Variables de entorno

En la pestaña **Environment** de la app:

```
DATABASE_URL=postgres://postgres:LA_PASSWORD@roabrew-db:5432/roabrew?sslmode=disable
AUTH_SECRET=pega-aqui-una-cadena-larga-y-aleatoria
ADMIN_EMAIL=tu-correo@roabrew.com
ADMIN_PASSWORD=una-clave-fuerte
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

Genera el `AUTH_SECRET` con:

```bash
openssl rand -base64 48
```

### 4. Desplegar y sembrar

Para el **primer** despliegue agrega también esta variable:

```
SEED_ON_START=true
```

Dale **Deploy**. Al arrancar, el contenedor crea las tablas con `prisma db push`
y carga la carta completa, todo solo (está en `docker-entrypoint.sh`).

Revisa los **Logs** del servicio: si dejaste `ADMIN_PASSWORD` sin definir, ahí
aparece la contraseña generada del panel. Cópiala.

Cuando confirmes que la carta cargó, **quita `SEED_ON_START`** (o ponla en
`false`) y redespliega. El seed es idempotente y nunca pisa la contraseña de un
admin existente, así que dejarlo puesto no rompe nada, pero alarga cada arranque.

> El seed corre con el intérprete de TypeScript nativo de Node
> (`node --experimental-strip-types`), así que no necesita `tsx` ni ninguna
> dependencia de desarrollo dentro de la imagen.

### 5. Dominio

**Domains → Add Domain**, apunta tu dominio y activa **HTTPS (Let's Encrypt)**.

### 6. Volumen para las fotos (opcional)

Si vas a subir imágenes a `/public/uploads`, agrega en **Mounts** un volumen
montado en `/app/public/uploads` para que sobrevivan a los redeploys.

---

## Cargar las fotos reales

Hoy cada bebida usa una ilustración generada. Para poner las fotos de los posters:

1. Sube las imágenes a `public/img/` (o a cualquier CDN).
2. En `/admin/productos` → editar bebida → campo **URL de la foto**:
   `/img/sparkling-hawaii.png` o la URL completa.

La foto reemplaza la ilustración automáticamente.

---

## Notas sobre precios

Los precios de **Cold Brew**, **Sparkling Tea** y **Milk Tea** salen tal cual de los
posters de la carta. Los de **Matcha** no venían con precio individual en el material,
así que se cargaron con una escala coherente (12 el latte simple, 14 los frutados,
16 los foams). Ajústalos en `/admin/productos` cuando confirmes los reales.

---

## Estructura

```
prisma/
  schema.prisma        Modelos: Category, Product, Extra, Promo, Order, OrderItem, AdminUser, Setting
  seed.ts              Carta completa extraída del brochure y los posters
src/
  app/
    (site)/            Sitio público
    admin/
      login/           Pantalla de acceso
      (panel)/         Panel protegido
      actions.ts       Server actions del CRUD
    api/
      orders/          Registra pedidos (recalcula precios en el servidor)
      auth/            Login y logout
  components/
    CupArt.tsx         Ilustrador generativo de bebidas
    BobaField.tsx      Burbujas flotantes del fondo
    cart/              Carrito y drawer de checkout
    sections/          Secciones de la landing
    admin/             UI del panel
  lib/                 prisma, auth, settings, menu, format
```

---

## Seguridad

- Los precios **nunca** se toman del cliente: `/api/orders` los recalcula desde la base.
- Los extras se validan contra la tabla `Extra`; uno inventado se descarta.
- Todas las server actions verifican sesión antes de tocar la base.
- El middleware protege `/admin/*` salvo el login.
