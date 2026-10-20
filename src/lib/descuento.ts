/**
 * Códigos de descuento para productos de aliados.
 *
 * Esta función es la única fuente de verdad del descuento: la usan el
 * endpoint que valida el código mientras el cliente lo escribe y
 * `/api/orders`, que la vuelve a correr antes de guardar. El navegador nunca
 * manda un monto, solo el texto del código.
 *
 * El descuento se calcula únicamente sobre las líneas de aliados. Las bebidas
 * propias no entran nunca: el margen de la marca aliada lo negocia ella, y un
 * código suelto que rebajara toda la carta se comería el margen del local sin
 * que nadie lo haya decidido.
 *
 * No importa nada del proyecto para poder probarse suelto.
 */

export type CodigoDescuento = {
  code: string;
  /** porcentaje | monto */
  kind: string;
  value: number;
  /** Limitado a un aliado. null: vale para cualquiera. */
  allyId: string | null;
  maxDiscount: number;
  minSubtotal: number;
  maxUses: number;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
};

/** Una línea del carrito, ya resuelta contra la base. */
export type LineaDescontable = {
  /** null si el producto es de la casa */
  allyId: string | null;
  /** Lo que cuesta esa línea completa, extras y cantidad incluidos */
  lineTotal: number;
};

export type ResultadoDescuento =
  | { ok: true; amount: number; base: number; message: string }
  | { ok: false; amount: 0; base: number; reason: Motivo; message: string };

export type Motivo =
  | "inexistente"
  | "inactivo"
  | "sin-vigencia"
  | "agotado"
  | "sin-productos"
  | "minimo"
  | "sin-efecto";

const round = (n: number) => Math.round(n * 100) / 100;

const MENSAJES: Record<Motivo, string> = {
  inexistente: "Ese código no existe.",
  inactivo: "Ese código ya no está disponible.",
  "sin-vigencia": "Ese código está fuera de fecha.",
  agotado: "Ese código ya se usó todas las veces.",
  "sin-productos":
    "Este código solo aplica a productos de nuestras marcas aliadas, y tu carrito no tiene ninguno.",
  minimo: "",
  "sin-efecto": "Ese código no cambia el total de tu pedido.",
};

/** Normaliza lo que el cliente teclea: espacios de más, minúsculas, acentos. */
export function normalizarCodigo(v: string): string {
  return v
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "");
}

/**
 * Cuánto descuenta el código sobre este carrito.
 *
 * `ahora` se recibe en vez de leerse adentro para que las pruebas puedan
 * situarse en una fecha concreta sin depender del reloj de la máquina.
 */
export function calcularDescuento(
  codigo: CodigoDescuento | null,
  lineas: LineaDescontable[],
  ahora: Date = new Date()
): ResultadoDescuento {
  // Solo las líneas de aliados, y si el código es de un aliado concreto,
  // solo las de ese
  const base = round(
    lineas
      .filter((l) => {
        if (!l.allyId) return false;
        if (codigo?.allyId) return l.allyId === codigo.allyId;
        return true;
      })
      .reduce((s, l) => s + l.lineTotal, 0)
  );

  const no = (reason: Motivo, message?: string): ResultadoDescuento => ({
    ok: false,
    amount: 0,
    base,
    reason,
    message: message ?? MENSAJES[reason],
  });

  if (!codigo) return no("inexistente");
  if (!codigo.active) return no("inactivo");

  if (codigo.startsAt && ahora < codigo.startsAt) return no("sin-vigencia");
  if (codigo.endsAt && ahora > codigo.endsAt) return no("sin-vigencia");

  // 0 usos máximos significa ilimitado, no "agotado desde el primer día"
  if (codigo.maxUses > 0 && codigo.usedCount >= codigo.maxUses) return no("agotado");

  if (base <= 0) return no("sin-productos");

  if (codigo.minSubtotal > 0 && base < codigo.minSubtotal) {
    return no(
      "minimo",
      `Este código pide al menos ${codigo.minSubtotal.toFixed(2)} en productos de aliados. Llevas ${base.toFixed(2)}.`
    );
  }

  let amount =
    codigo.kind === "monto" ? codigo.value : (base * codigo.value) / 100;

  // El tope solo tiene sentido en el porcentaje: en un monto fijo el propio
  // valor ya es el tope
  if (codigo.kind !== "monto" && codigo.maxDiscount > 0) {
    amount = Math.min(amount, codigo.maxDiscount);
  }

  // Nunca más que lo que cuestan los productos de aliados: un código de
  // 20 soles sobre una compra de 12 no puede empezar a descontar las
  // bebidas de la casa
  amount = round(Math.min(amount, base));

  if (amount <= 0) return no("sin-efecto");

  return {
    ok: true,
    amount,
    base,
    message:
      codigo.kind === "monto"
        ? `Código aplicado: ${amount.toFixed(2)} de descuento.`
        : `Código aplicado: ${codigo.value}% en productos de aliados.`,
  };
}
