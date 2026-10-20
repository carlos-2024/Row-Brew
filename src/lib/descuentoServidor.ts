import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import {
  calcularDescuento,
  normalizarCodigo,
  type CodigoDescuento,
  type LineaDescontable,
  type ResultadoDescuento,
} from "@/lib/descuento";

/** Lo que manda el navegador: qué productos lleva y cuántos. */
export type ItemCrudo = { productId: string; quantity: number; extrasTotal?: number };

/**
 * Resuelve un código contra el carrito, leyendo todo de la base.
 *
 * El navegador manda el texto del código y los productos; nunca un monto ni
 * un precio. De qué aliado es cada producto y cuánto cuesta se lee acá, así
 * que retocar el carrito desde la consola no cambia el descuento.
 *
 * Lo usan el endpoint que valida mientras el cliente escribe y `/api/orders`
 * al registrar el pedido. Que sea la misma función es lo que evita que el
 * carrito prometa un descuento que después no se cobre.
 */
export async function resolverDescuento(
  textoCodigo: string,
  items: ItemCrudo[]
): Promise<ResultadoDescuento & { code: string | null; id: string | null }> {
  const code = normalizarCodigo(textoCodigo);

  const lineas = await lineasDeCarrito(items);

  if (!code) {
    return { ...calcularDescuento(null, lineas), code: null, id: null };
  }

  const fila = await prisma.discountCode.findUnique({ where: { code } });

  const codigo: CodigoDescuento | null = fila
    ? {
        code: fila.code,
        kind: fila.kind,
        value: toNumber(fila.value),
        allyId: fila.allyId,
        maxDiscount: toNumber(fila.maxDiscount),
        minSubtotal: toNumber(fila.minSubtotal),
        maxUses: fila.maxUses,
        usedCount: fila.usedCount,
        startsAt: fila.startsAt,
        endsAt: fila.endsAt,
        active: fila.active,
      }
    : null;

  return {
    ...calcularDescuento(codigo, lineas),
    code: fila?.code ?? null,
    id: fila?.id ?? null,
  };
}

/** Convierte el carrito en líneas con su aliado y su total, leído de la base. */
async function lineasDeCarrito(items: ItemCrudo[]): Promise<LineaDescontable[]> {
  const ids = [...new Set(items.map((i) => String(i.productId)).filter(Boolean))];
  if (ids.length === 0) return [];

  const productos = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, price: true, allyId: true },
  });
  const porId = new Map(productos.map((p) => [p.id, p]));

  return items.flatMap((i) => {
    const p = porId.get(String(i.productId));
    if (!p) return [];

    const cantidad = Math.max(1, Math.min(50, Math.floor(Number(i.quantity) || 1)));
    // Los extras del navegador solo suman: aunque mintiera, el descuento se
    // recorta al total de las líneas de aliados y el precio real lo arma
    // /api/orders por su cuenta
    const extras = Math.max(0, Number(i.extrasTotal) || 0);

    return [{ allyId: p.allyId, lineTotal: (toNumber(p.price) + extras) * cantidad }];
  });
}
