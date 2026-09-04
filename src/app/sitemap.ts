import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getIndexableProducts } from "@/lib/product";
import { absoluteUrl, comingSoon } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Mapa del sitio.
 *
 * Se arma en cada petición y no en el build: los productos se crean y se
 * apagan desde el panel, y un sitemap congelado en el despliegue seguiría
 * ofreciéndole a Google bebidas que ya no existen.
 *
 * En modo lanzamiento se devuelve vacío. Listar páginas que redirigen a la
 * cuenta regresiva solo consigue que Google las registre como redirecciones.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (comingSoon()) return [];

  const [productos, aliados] = await Promise.all([
    getIndexableProducts(),
    prisma.ally
      .findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
      })
      .catch(() => []),
  ]);

  const fijas: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/carta"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/fidelidad"), changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...fijas,
    ...productos.map((p) => ({
      url: absoluteUrl(`/producto/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...aliados.map((a) => ({
      url: absoluteUrl(`/aliados/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
