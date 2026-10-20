import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";

export type EventoProducto = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categorySlug: string;
  kind: string;
  temperature: string;
  badge: string | null;
};

export type EventoFoto = {
  id: string;
  url: string;
  caption: string | null;
};

/**
 * La carta del evento y las fotos de la galería.
 *
 * Los dos tragos de la consulta van juntos: la página los necesita siempre y
 * así se pagan en paralelo en vez de uno detrás del otro.
 *
 * Si la base no responde se devuelve vacío en vez de reventar: la página de
 * evento se mira desde una feria, con el dato del celular, y es mejor que se
 * vea el afiche solo a que no se vea nada.
 */
export async function getEvento(): Promise<{
  productos: EventoProducto[];
  fotos: EventoFoto[];
}> {
  try {
    const [productos, fotos] = await Promise.all([
      prisma.eventProduct.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      }),
      prisma.eventPhoto.findMany({
        where: { active: true },
        orderBy: { position: "asc" },
      }),
    ]);

    return {
      productos: productos.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: toNumber(p.price),
        imageUrl: p.imageUrl,
        categorySlug: p.categorySlug,
        kind: p.kind,
        temperature: p.temperature,
        badge: p.badge,
      })),
      fotos: fotos.map((f) => ({ id: f.id, url: f.url, caption: f.caption })),
    };
  } catch {
    return { productos: [], fotos: [] };
  }
}
