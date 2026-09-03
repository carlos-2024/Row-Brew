import type { Decimal } from "@prisma/client/runtime/library";

/** Convierte un Decimal de Prisma (o cualquier cosa numérica) a number. */
export function toNumber(value: Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

/** S/ 12.00 */
export function money(value: Decimal | number | string, currency = "S/"): string {
  const n = toNumber(value as number);
  return `${currency} ${n.toFixed(2)}`;
}

/** Precio compacto para la carta: 12 en vez de 12.00 */
export function priceTag(value: Decimal | number | string): string {
  const n = toNumber(value as number);
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** ROA-7K2M9 */
export function orderCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `ROA-${out}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Preparando",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export const DELIVERY_LABELS: Record<string, string> = {
  recojo: "Recojo en Pop Up House",
  delivery: "Delivery",
  evento: "Evento / corporativo",
};

/**
 * Cómo llamar a lo que se vende, según lo que haya.
 *
 * La carta empezó siendo solo bebidas y el texto lo decía en todas partes.
 * Al entrar comidas y postres, "42 bebidas" pasó a ser falso; pero cambiarlo
 * a "productos" siempre suena a inventario. Así que se dice lo específico
 * cuando todo es de un tipo, y lo genérico solo cuando hay mezcla.
 */
export function nombreProductos(kinds: string[], cantidad = 2): string {
  const unicos = new Set(kinds);
  const plural = cantidad !== 1;

  if (unicos.size === 1) {
    const [k] = [...unicos];
    if (k === "comida") return plural ? "platos" : "plato";
    if (k === "postre") return plural ? "postres" : "postre";
    return plural ? "bebidas" : "bebida";
  }

  return plural ? "productos" : "producto";
}
