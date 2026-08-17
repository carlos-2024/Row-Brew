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
          where: { active: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
        },
      },
    });

    return categories.map((c) => ({
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
      include: { category: { select: { slug: true } } },
    });
    return promos.map((p) => ({
      id: p.id,
      title: p.title,
      label: p.label,
      detail: p.detail,
      price: toNumber(p.price),
      theme: p.theme,
      imageUrl: p.imageUrl,
      categorySlug: p.category?.slug ?? null,
    }));
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
      include: { category: { select: { slug: true } } },
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
