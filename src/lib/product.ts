import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import type { MenuProduct } from "@/lib/types";
import type { SeoFields } from "@/lib/seo";

export type ProductPage = MenuProduct &
  SeoFields & {
    active: boolean;
    categoryTagline: string | null;
    /** Marca aliada, si la bebida viene de una */
    allyName: string | null;
    allySlug: string | null;
  };

/**
 * Una bebida con todo lo que necesita su propia página.
 *
 * A diferencia de `getMenu`, trae también las apagadas: un enlace compartido o
 * indexado sigue llevando ahí, y es mejor mostrar la ficha marcada como no
 * disponible que un 404 — para Google y para quien recibió el enlace.
 */
export async function getProductBySlug(slug: string): Promise<ProductPage | null> {
  try {
    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true, kind: true, tagline: true } },
        ally: { select: { name: true, slug: true } },
        extraGroups: {
          where: { active: true },
          orderBy: { position: "asc" },
          include: {
            extras: {
              where: { active: true },
              orderBy: [{ position: "asc" }, { name: "asc" }],
            },
          },
        },
      },
    });
    if (!p) return null;

    return {
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
      active: p.active,
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      categoryKind: p.category.kind,
      categoryTagline: p.category.tagline,
      allyName: p.ally?.name ?? null,
      allySlug: p.ally?.slug ?? null,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      seoKeywords: p.seoKeywords,
      imageAlt: p.imageAlt,
      extraGroups: p.extraGroups.map((g) => ({
        id: g.id,
        name: g.name,
        hint: g.hint,
        maxChoices: g.maxChoices,
        extras: g.extras.map((e) => ({
          id: e.id,
          name: e.name,
          price: toNumber(e.price),
        })),
      })),
    };
  } catch {
    return null;
  }
}

/** Slugs de todo lo que debe entrar al sitemap y prerenderizarse. */
export async function getIndexableProducts(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  try {
    return await prisma.product.findMany({
      // Solo lo que de verdad se vende: ofrecerle a Google una bebida retirada
      // manda tráfico a una página que solo dice "no disponible".
      where: { active: true },
      orderBy: { position: "asc" },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    return [];
  }
}

/** Otras bebidas de la misma familia, para no dejar la ficha sin salida. */
export async function getRelated(
  categorySlug: string,
  exceptId: string,
  take = 4
): Promise<MenuProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: {
        active: true,
        allyId: null,
        id: { not: exceptId },
        category: { slug: categorySlug },
      },
      orderBy: [{ featured: "desc" }, { position: "asc" }],
      take,
      include: { category: { select: { name: true, slug: true, kind: true } } },
    });

    return rows.map((p) => ({
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
      categorySlug: p.category.slug,
      categoryName: p.category.name,
      categoryKind: p.category.kind,
    }));
  } catch {
    return [];
  }
}
