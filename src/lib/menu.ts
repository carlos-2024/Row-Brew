import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import type { MenuCategory, MenuExtra, MenuProduct, PromoView } from "@/lib/types";
import type { PromoRule } from "@/lib/pricing";

/** Carta completa, agrupada por categoría y lista para el cliente. */
export async function getMenu(): Promise<MenuCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      include: {
        products: {
          // Los productos de marcas aliadas se venden desde su propia
          // sección, no desde la carta
          where: { active: true, allyId: null },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
      },
    });

    return categories
      .filter((c) => c.products.length > 0)
      .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      tagline: c.tagline,
      description: c.description,
      theme: c.theme,
      emoji: c.emoji,
      products: c.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: toNumber(p.price),
        imageUrl: p.imageUrl,
        badge: p.badge,
        size: p.size,
        featured: p.featured,
        promoEligible: p.promoEligible,
        categorySlug: c.slug,
        categoryName: c.name,
      })),
      }));
  } catch {
    return [];
  }
}

export async function getFeatured(limit = 6): Promise<MenuProduct[]> {
  const menu = await getMenu();
  const featured = menu.flatMap((c) => c.products.filter((p) => p.featured));
  return featured.slice(0, limit);
}

export async function getPromos(): Promise<PromoView[]> {
  try {
    const promos = await prisma.promo.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      include: {
        // Bebidas elegidas para esta promo en concreto
        products: {
          where: { active: true, allyId: null },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
        category: {
          select: {
            slug: true,
            name: true,
            // Solo las bebidas que de verdad entran en la promo. Se traen
            // únicamente para las promos que el carrito cobra solas: son las
            // únicas donde tiene sentido ofrecer armar el combo.
            products: {
              where: { active: true, allyId: null, promoEligible: true },
              orderBy: [{ position: "asc" }, { name: "asc" }],
            },
          },
        },
      },
    });

    return promos.map((p) => {
      // Se saca a una constante para que TypeScript pueda estrecharla dentro
      // del map de abajo
      const cat = p.category;

      return {
        id: p.id,
        title: p.title,
        label: p.label,
        detail: p.detail,
        price: toNumber(p.price),
        quantity: p.quantity,
        autoApply: p.autoApply,
        theme: p.theme,
        imageUrl: p.imageUrl,
        categorySlug: cat?.slug ?? null,
        // Se listan para toda promo con categoría, no solo para las que el
        // carrito cobra solas: el cliente puede armar el combo a propósito
        // aunque la promo no se aplique sola al juntar bebidas sueltas.
        // Las bebidas elegidas a mano mandan; si no se eligió ninguna se
        // ofrecen todas las de la categoría, como funcionaba antes.
        products: (p.products.length > 0 ? p.products : (cat?.products ?? [])).map(
          (prod) => ({
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            price: toNumber(prod.price),
            imageUrl: prod.imageUrl,
            badge: prod.badge,
            size: prod.size,
            featured: prod.featured,
            promoEligible: prod.promoEligible,
            categorySlug: cat?.slug ?? "",
            categoryName: cat?.name ?? "",
          })
        ),
      };
    });
  } catch {
    return [];
  }
}

/**
 * Promos que el carrito cobra solas. Se ordenan por `position` y luego se
 * deja una sola por categoría, para que el precio sea siempre predecible.
 */
export async function getAutoPromos(): Promise<PromoRule[]> {
  try {
    const promos = await prisma.promo.findMany({
      where: { active: true, autoApply: true, categoryId: { not: null } },
      orderBy: { position: "asc" },
      include: {
        category: { select: { slug: true } },
        products: { select: { id: true } },
      },
    });

    return promos
      .filter((p) => p.category?.slug)
      .map((p) => ({
        id: p.id,
        title: p.title,
        label: p.label,
        categorySlug: p.category!.slug,
        quantity: p.quantity,
        price: toNumber(p.price),
        productIds: p.products.map((prod) => prod.id),
      }));
  } catch {
    return [];
  }
}

export async function getExtras(): Promise<MenuExtra[]> {
  try {
    const extras = await prisma.extra.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
    });
    return extras.map((e) => ({
      id: e.id,
      name: e.name,
      price: toNumber(e.price),
    }));
  } catch {
    return [];
  }
}

/**
 * Reglas de las promos que el cliente armó a propósito desde su tarjeta.
 *
 * El navegador solo manda los identificadores: el precio, el tamaño del combo
 * y la categoría se leen siempre de la base. Así, mandar un id ajeno no
 * inventa un descuento, y `priceCart` igual exige que estén las bebidas.
 */
export async function getPromoRulesByIds(ids: string[]): Promise<PromoRule[]> {
  const limpios = [...new Set(ids.filter((id) => typeof id === "string" && id))];
  if (limpios.length === 0) return [];

  try {
    const promos = await prisma.promo.findMany({
      where: { id: { in: limpios.slice(0, 10) }, active: true, categoryId: { not: null } },
      orderBy: { position: "asc" },
      include: {
        category: { select: { slug: true } },
        products: { select: { id: true } },
      },
    });

    return promos
      .filter((p) => p.category?.slug)
      .map((p) => ({
        id: p.id,
        title: p.title,
        label: p.label,
        categorySlug: p.category!.slug,
        quantity: p.quantity,
        price: toNumber(p.price),
        productIds: p.products.map((prod) => prod.id),
      }));
  } catch {
    return [];
  }
}
