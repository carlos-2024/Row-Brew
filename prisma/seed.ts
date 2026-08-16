/**
 * Seed de Roa Brew.
 * Carga la carta completa extraída del brochure y los posters de la marca.
 *
 *   npm run db:seed
 *
 * Es idempotente: se puede correr las veces que haga falta.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type Item = {
  name: string;
  description?: string;
  price: number;
  badge?: "nuevo" | "estrella";
  featured?: boolean;
  size?: string;
};

const CATALOG: {
  name: string;
  tagline: string;
  description: string;
  theme: string;
  emoji: string;
  items: Item[];
}[] = [
  {
    name: "Sparkling Tea",
    tagline: "Té frío + Fruta + Popping boba",
    description:
      "Nuestra versión de bubble tea a base de fruta natural, selección de té verde y bobas taiwanesas. Puedes pedirlo sin azúcar.",
    theme: "green",
    emoji: "🫧",
    items: [
      {
        name: "Sparkling Hawaii",
        description:
          "Té verde con jarabe de piña + mango + maracuyá acompañado por nuestras bobas.",
        price: 12,
        badge: "nuevo",
        featured: true,
        size: "16oz",
      },
      {
        name: "Berrys Chaos",
        description:
          "Té verde con té de durazno, arándano y fresa, burbujas ligeras y boba de fresa que explota en cada sorbo.",
        price: 12,
        featured: true,
        size: "16oz",
      },
      {
        name: "Sparkling MaracuMango",
        description:
          "Té frío con syrup de mango y maracuyá, popping boba de mango. Tropical, refrescante y lleno de burbujas.",
        price: 12,
        featured: true,
        size: "16oz",
      },
      {
        name: "Mango Fresita",
        description:
          "Té verde con mango y fresa, popping boba de mango y agua gasificada. Refrescante y dulce.",
        price: 12,
        size: "16oz",
      },
      {
        name: "Strawberry Passion",
        description:
          "Té frío con syrup de fresa y maracuyá, popping boba de maracuyá. Tropical y lleno de burbujas.",
        price: 12,
        size: "16oz",
      },
      {
        name: "Strawberry Lemon Pop",
        description:
          "Té verde con syrup de fresa, limonada natural y popping boba de fresa. Refrescante y chispeante.",
        price: 12,
        size: "16oz",
      },
      {
        name: "Sparkling Mango Pop",
        description:
          "Té verde refrescante con mango natural, burbujas ligeras y popping boba de mango que explota en cada sorbo.",
        price: 12,
        size: "16oz",
      },
      {
        name: "Strawberry Mango Pop",
        description:
          "Té verde con mango y fresa, popping boba de mango y agua gasificada. Refrescante y dulce.",
        price: 12,
        size: "16oz",
      },
      {
        name: "Dragon Lov Tea",
        description:
          "Té frío de pitahaya con bobas. Rosado intenso, dulce y muy instagrameable.",
        price: 12,
        size: "16oz",
      },
    ],
  },
  {
    name: "Matcha",
    tagline: "Ceremonial, batido al momento",
    description:
      "Matcha frío en versión con leche, sin leche y sparkling. Lattes frutados en 12oz y foams cremosos.",
    theme: "cream",
    emoji: "🍵",
    items: [
      {
        name: "Matcha Taro",
        description:
          "Matcha batido sobre una base cremosa de taro. Capa verde intensa sobre lila. Todo agosto viene con topping de tapioca gratis.",
        price: 16,
        badge: "nuevo",
        featured: true,
        size: "12oz",
      },
      {
        name: "Iced Matcha Latte",
        description: "Matcha + leche (entera o sin lactosa) sobre hielo.",
        price: 12,
        featured: true,
      },
      {
        name: "Vainilla Matcha Latte",
        description: "Matcha + leche + cold foam de vainilla.",
        price: 14,
        featured: true,
      },
      {
        name: "Sparkling Lemonade Matcha",
        description:
          "Matcha frío combinado con limonada natural. Refrescante, cítrico y ligeramente herbal. Sin leche.",
        price: 12,
      },
      {
        name: "Sparkling Maracumango Matcha",
        description:
          "Matcha frío combinado con maracuyá y mango natural. Refrescante, con un toque dulce y amable.",
        price: 14,
        featured: true,
      },
      {
        name: "Strawberry Matcha Pop",
        description: "Matcha + fresa + leche + popping boba de fresa.",
        price: 14,
        size: "12oz",
      },
      {
        name: "Mango Matcha Foam",
        description: "Matcha + leche + mango + cold foam + popping boba.",
        price: 16,
        size: "12oz",
      },
      {
        name: "Arándano Matcha Latte",
        description: "Matcha + leche + arándano + cold foam + popping boba.",
        price: 16,
        size: "12oz",
      },
      {
        name: "Pistacho Matcha Foam",
        description:
          "Matcha con cold foam de pistacho y crocante encima. Ningún Koda fue obligado a pelar pistacho.",
        price: 16,
        badge: "estrella",
        featured: true,
      },
      {
        name: "Pink Green Cloud",
        description: "Base cremosa de fresa coronada con una nube de matcha batido.",
        price: 16,
      },
      {
        name: "Pink Foam Matcha",
        description: "Matcha con cold foam rosado de fresa. Nuestro favorito de temporada.",
        price: 14,
      },
    ],
  },
  {
    name: "Cold Brew",
    tagline: "Café de especialidad extraído en frío por 18hrs+",
    description:
      "No es café frío. Es café preparado para disfrutarse frío. Más dulce naturalmente, menor acidez, más suave.",
    theme: "black",
    emoji: "☕",
    items: [
      {
        name: "Taro Coffee",
        description:
          "Cold brew sobre base cremosa de taro, coronado con cold foam. Todo agosto viene con topping de tapioca gratis.",
        price: 16,
        badge: "nuevo",
        featured: true,
        size: "12oz",
      },
      {
        name: "Cold Brew",
        description: "Nuestro cold brew puro, extraído lentamente durante 18 a 24 horas.",
        price: 10,
        featured: true,
      },
      {
        name: "Orange Cold Brew",
        description: "Jugo de naranja natural + cold brew.",
        price: 14,
      },
      {
        name: "Maracumango ColdBrew",
        description: "Maracuyá + mango + cold brew + ginger ale.",
        price: 14,
      },
      {
        name: "Berrys Brew",
        description: "Frutos rojos + syrup + ginger ale + cold brew.",
        price: 14,
      },
      {
        name: "Golden Cold Brew",
        description:
          "Jarabe de piña, con toque de coco, cold brew y leche espumada.",
        price: 14,
        badge: "estrella",
        featured: true,
      },
      {
        name: "Mont Blanc by Roa Brew",
        description:
          "Crema con toques de naranja, base de jugo de naranja + cold brew. Pregunta por nuestra versión en mandarina.",
        price: 16,
        badge: "estrella",
        featured: true,
      },
      {
        name: "Matchbrew",
        description:
          "Una versión de nuestro cold brew con una crema de matcha. Un sabor que mezcla dos mundos.",
        price: 16,
        badge: "estrella",
        featured: true,
      },
      {
        name: "Ubecito",
        description:
          "Prueba una versión del ube, una bebida en tendencia con nuestro café. Un latte muy llamativo y morado.",
        price: 16,
        badge: "estrella",
      },
      {
        name: "Caramel Brew Latte",
        description: "Nuestro caramelo de casa con leche espumada y cold brew.",
        price: 12,
      },
      {
        name: "Vainilla Brew Latte",
        description: "Cold brew con syrup de vainilla francesa y leche espumada.",
        price: 12,
      },
      {
        name: "Vainilla Cold Brew Foam",
        description: "Vainilla + cold brew + cold foam.",
        price: 14,
      },
      {
        name: "Pistacho Coldbrew Foam",
        description: "Cold brew coronado con cold foam de pistacho.",
        price: 16,
      },
      {
        name: "Limonada Cold Brew",
        description: "Miel + limón + cold brew + agua gasificada.",
        price: 14,
      },
      {
        name: "Arándano Cold Brew",
        description: "Arándano + cold brew + agua gasificada.",
        price: 14,
      },
      {
        name: "Pink Cold Brew",
        description: "Fresa + cold brew + agua gasificada.",
        price: 14,
      },
      {
        name: "Strawberry Milk Cold Brew",
        description:
          "Cold brew, syrup de fresa, coronado con una capa cremosa de cold foam de fresa. Dulce, equilibrado y refrescante.",
        price: 14,
      },
    ],
  },
  {
    name: "Milk Tea",
    tagline: "Bebidas con base de té y leche · taro",
    description:
      "Clásicos con tapioca recién cocida. No olvides remover tu bebida, brew brew.",
    theme: "purple",
    emoji: "🧋",
    items: [
      {
        name: "Roa Tea",
        description: "Té negro + leche espumada + tapioca.",
        price: 12,
        featured: true,
      },
      {
        name: "Taro Tapioca",
        description: "Taro + leche + tapioca.",
        price: 12,
        featured: true,
      },
      {
        name: "Taro Fresita",
        description: "Taro + leche + tapioca + fresa.",
        price: 14,
        featured: true,
      },
      { name: "Mango Milk Tea", description: "Té + leche + mango.", price: 14 },
      { name: "Fresita Milk Tea", description: "Té + leche + fresa.", price: 14 },
    ],
  },
];

const PROMOS = [
  {
    title: "Sparkling Tea",
    label: "2x20",
    detail: "Bebidas con popping boba",
    price: 20,
    theme: "green",
    categorySlug: "sparkling-tea",
  },
  {
    title: "Matcha",
    label: "2x22",
    detail: "Válido para Mango · Fresa · Arándano",
    price: 22,
    theme: "cream",
    categorySlug: "matcha",
  },
  {
    title: "Matcha Latte Frutado",
    label: "2x25",
    detail: "Versión latte frutado 12oz",
    price: 25,
    theme: "cream",
    categorySlug: "matcha",
  },
  {
    title: "Milk Tea",
    label: "2x20",
    detail: "Válido para Milk Tea · Taro Tapioca",
    price: 20,
    theme: "purple",
    categorySlug: "milk-tea",
  },
  {
    title: "Cold Brew Frutados",
    label: "2x20",
    detail: "Fresa · Arándano · Limonada · Naranja",
    price: 20,
    theme: "black",
    categorySlug: "cold-brew",
  },
];

const EXTRAS = [
  { name: "Tapioca", price: 2 },
  { name: "Popping Boba", price: 2 },
  { name: "Leche sin lactosa", price: 2 },
  { name: "Shot extra de cold brew", price: 3 },
];

const SETTINGS: Record<string, string> = {
  brandName: "Roa Brew",
  tagline: "Té · Matcha · Cold Brew",
  heroKicker: "hola brew brew",
  heroTitle: "Bebidas artesanales que se ven tan bien como saben",
  heroSubtitle:
    "Matcha ceremonial, café de especialidad extraído en frío y té con popping boba. Hechos a mano en Los Olivos, Lima.",
  whatsapp: "51933948864",
  whatsappDisplay: "933 948 864",
  instagram: "roabrew",
  tiktok: "roabrew",
  location: "Los Olivos — Lima, Perú",
  schedule: "Mar a Dom · 3:00 pm — 10:00 pm",
  currency: "S/",
  deliveryNote:
    "Delivery por Yango / InDrive coordinado por WhatsApp. Recojo en nuestro Pop Up House.",
  eventsNote:
    "Ofrecemos una experiencia completa de bebidas para eventos, ferias, Pop Up y corporativos.",
};

async function main() {
  console.log("🌱 Sembrando la carta de Roa Brew…\n");

  // ── Admin ──────────────────────────────────────────────
  const email = process.env.ADMIN_EMAIL || "admin@roabrew.com";

  // Sin contraseña por defecto: este repo es público, así que una clave fija
  // aquí sería una puerta abierta. Si no se define ADMIN_PASSWORD se genera
  // una aleatoria y se imprime una única vez.
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await prisma.adminUser.findUnique({ where: { email } });

  await prisma.adminUser.upsert({
    where: { email },
    update: {}, // nunca se pisa la contraseña de un admin que ya existe
    create: { email, passwordHash, name: "Equipo Roa" },
  });

  if (existing) {
    console.log(`👤 Admin ya existía → ${email} (se conserva su contraseña)`);
  } else {
    console.log(`👤 Admin creado → ${email}`);
    if (generated) {
      console.log(`   🔑 Contraseña generada: ${password}`);
      console.log(`   ⚠️  Guárdala ahora, no se vuelve a mostrar.`);
    }
  }

  // ── Ajustes ────────────────────────────────────────────
  for (const [key, value] of Object.entries(SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log(`⚙️  ${Object.keys(SETTINGS).length} ajustes cargados`);

  // ── Extras ─────────────────────────────────────────────
  for (const [i, extra] of EXTRAS.entries()) {
    const existing = await prisma.extra.findFirst({ where: { name: extra.name } });
    if (!existing) {
      await prisma.extra.create({ data: { ...extra, position: i } });
    }
  }
  console.log(`➕ ${EXTRAS.length} extras cargados`);

  // ── Categorías y productos ─────────────────────────────
  let totalProducts = 0;
  for (const [catIndex, cat] of CATALOG.entries()) {
    const slug = slugify(cat.name);
    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: cat.name,
        tagline: cat.tagline,
        description: cat.description,
        theme: cat.theme,
        emoji: cat.emoji,
        position: catIndex,
      },
      create: {
        name: cat.name,
        slug,
        tagline: cat.tagline,
        description: cat.description,
        theme: cat.theme,
        emoji: cat.emoji,
        position: catIndex,
      },
    });

    for (const [i, item] of cat.items.entries()) {
      const pSlug = slugify(item.name);
      await prisma.product.upsert({
        where: { slug: pSlug },
        update: {
          name: item.name,
          description: item.description,
          price: item.price,
          badge: item.badge ?? null,
          size: item.size ?? null,
          featured: item.featured ?? false,
          position: i,
          categoryId: category.id,
        },
        create: {
          name: item.name,
          slug: pSlug,
          description: item.description,
          price: item.price,
          badge: item.badge ?? null,
          size: item.size ?? null,
          featured: item.featured ?? false,
          position: i,
          categoryId: category.id,
        },
      });
      totalProducts++;
    }
    console.log(`   ${cat.emoji}  ${cat.name} — ${cat.items.length} bebidas`);
  }
  console.log(`\n🥤 ${totalProducts} productos en total`);

  // ── Promos ─────────────────────────────────────────────
  for (const [i, promo] of PROMOS.entries()) {
    const category = await prisma.category.findUnique({
      where: { slug: promo.categorySlug },
    });
    const existing = await prisma.promo.findFirst({
      where: { title: promo.title, label: promo.label },
    });
    const data = {
      title: promo.title,
      label: promo.label,
      detail: promo.detail,
      price: promo.price,
      quantity: 2,
      theme: promo.theme,
      position: i,
      categoryId: category?.id ?? null,
    };
    if (existing) {
      await prisma.promo.update({ where: { id: existing.id }, data });
    } else {
      await prisma.promo.create({ data });
    }
  }
  console.log(`🏷️  ${PROMOS.length} promos cargadas`);

  console.log("\n✅ Listo. Entra a /admin con las credenciales de arriba.\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
