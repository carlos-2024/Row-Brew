import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import type { AllySummary, AllyView } from "@/lib/types";

/**
 * Solo lo que necesita la tarjeta del inicio.
 *
 * Existe aparte de `getAllies` porque la historia completa y la galería
 * viajarían al navegador en cada visita a la home sin llegar a mostrarse.
 */
export async function getAlliesSummary(): Promise<AllySummary[]> {
  try {
    const allies = await prisma.ally.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        logoUrl: true,
        coverUrl: true,
        _count: { select: { products: { where: { active: true } } } },
      },
    });

    return allies.map(({ _count, ...a }) => ({
      ...a,
      productCount: _count.products,
    }));
  } catch {
    return [];
  }
}

/**
 * Marcas aliadas con su historia, su galería y los productos que les vendemos.
 *
 * Sus productos son `Product` normales con `allyId`, así que pasan por el
 * mismo carrito y los mismos pedidos que las bebidas. Lo único distinto es
 * que no aparecen en la carta: `getMenu` los excluye.
 */
export async function getAllies(): Promise<AllyView[]> {
  try {
    const allies = await prisma.ally.findMany({
      where: { active: true },
      orderBy: { position: "asc" },
      include: {
        images: { orderBy: { position: "asc" } },
        products: {
          where: { active: true },
          orderBy: [{ position: "asc" }, { name: "asc" }],
          include: { category: { select: { slug: true, name: true, kind: true } } },
        },
      },
    });

    return allies.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      tagline: a.tagline,
      storyTitle: a.storyTitle,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      seoKeywords: a.seoKeywords,
      imageAlt: a.imageAlt,
      story: a.story,
      logoUrl: a.logoUrl,
      coverUrl: a.coverUrl,
      images: a.images.map((i) => ({
        id: i.id,
        url: i.url,
        caption: i.caption,
      })),
      products: a.products.map((p) => ({
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
      })),
    }));
  } catch {
    return [];
  }
}
