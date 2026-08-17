/**
 * Cálculo de promociones del carrito.
 *
 * Esta función es la única fuente de verdad del precio: la usan tanto el
 * carrito del navegador (para mostrar el total en vivo) como `/api/orders`
 * (que recalcula todo antes de guardar). Así el cliente y el servidor no
 * pueden discrepar.
 */

export type PromoRule = {
  id: string;
  title: string;
  label: string;
  /** Categoría cuyos productos entran en la promo */
  categorySlug: string;
  /** Cuántas bebidas forman un combo */
  quantity: number;
  /** Precio total del combo */
  price: number;
};

export type PriceableItem = {
  /** Precio de lista del producto, sin extras */
  basePrice: number;
  /** Suma de los extras de UNA unidad */
  extrasTotal: number;
  quantity: number;
  categorySlug: string;
  promoEligible: boolean;
};

export type AppliedPromo = {
  id: string;
  title: string;
  label: string;
  /** Cuántos combos completos se armaron */
  bundles: number;
  /** Cuánto se ahorra el cliente */
  saved: number;
};

export type PromoHint = {
  id: string;
  title: string;
  label: string;
  /** Cuántas bebidas faltan para completar el siguiente combo */
  missing: number;
};

export type PriceBreakdown = {
  /** Todo a precio de lista, extras incluidos */
  subtotal: number;
  /** Total ahorrado por promociones */
  discount: number;
  /** Lo que realmente se cobra */
  total: number;
  applied: AppliedPromo[];
  hints: PromoHint[];
};

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Una categoría puede tener varias promos (Matcha tiene 2x22 y 2x25), pero el
 * carrito solo puede cobrar una. Se respeta el orden recibido y se descarta el
 * resto para que el resultado sea siempre predecible.
 */
function onePromoPerCategory(promos: PromoRule[]): PromoRule[] {
  const seen = new Set<string>();
  return promos.filter((p) => {
    if (seen.has(p.categorySlug)) return false;
    seen.add(p.categorySlug);
    return true;
  });
}

export function priceCart(
  items: PriceableItem[],
  promos: PromoRule[]
): PriceBreakdown {
  const subtotal = items.reduce(
    (sum, i) => sum + (i.basePrice + i.extrasTotal) * i.quantity,
    0
  );

  const applied: AppliedPromo[] = [];
  const hints: PromoHint[] = [];
  let discount = 0;

  for (const promo of onePromoPerCategory(promos)) {
    if (promo.quantity < 2) continue;

    // Cada unidad cuenta por separado: 2 unidades del mismo producto también
    // arman combo. Solo se considera el precio base; los extras se cobran
    // siempre aparte.
    const units: number[] = [];
    for (const item of items) {
      if (item.categorySlug !== promo.categorySlug || !item.promoEligible) continue;
      for (let i = 0; i < item.quantity; i++) units.push(item.basePrice);
    }

    if (units.length === 0) continue;

    // De mayor a menor: el combo cubre las bebidas más caras, que es lo que
    // más le conviene al cliente.
    units.sort((a, b) => b - a);

    const bundles = Math.floor(units.length / promo.quantity);
    const leftover = units.length - bundles * promo.quantity;

    if (bundles > 0) {
      const bundledSum = units
        .slice(0, bundles * promo.quantity)
        .reduce((s, p) => s + p, 0);
      const saved = round(bundledSum - bundles * promo.price);

      // Si la promo saliera más cara que los precios sueltos, no se aplica.
      if (saved > 0) {
        discount += saved;
        applied.push({
          id: promo.id,
          title: promo.title,
          label: promo.label,
          bundles,
          saved,
        });
      }
    }

    if (leftover > 0) {
      hints.push({
        id: promo.id,
        title: promo.title,
        label: promo.label,
        missing: promo.quantity - leftover,
      });
    }
  }

  discount = round(discount);
  return {
    subtotal: round(subtotal),
    discount,
    total: round(subtotal - discount),
    applied,
    hints,
  };
}
