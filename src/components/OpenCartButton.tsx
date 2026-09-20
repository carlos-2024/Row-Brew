"use client";

import { useCart } from "@/components/cart/CartProvider";

/**
 * Abre el carrito desde cualquier parte del sitio.
 *
 * El "Pedir ahora" del inicio llevaba directo a WhatsApp: quien entraba y lo
 * tocaba sin haber elegido nada abría un chat en blanco, sin pedido y sin
 * saber qué escribir. Abrir el carrito deja ver lo que lleva y, si está vacío,
 * lo manda a la carta.
 */
export default function OpenCartButton({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const { setOpen, count } = useCart();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={
        count > 0
          ? `Abrir carrito con ${count} producto${count > 1 ? "s" : ""}`
          : "Abrir carrito"
      }
      className={className}
    >
      {children}
      {count > 0 && (
        <span className="ml-2 inline-grid h-6 min-w-6 place-items-center rounded-full bg-mango px-1.5 text-sm font-black text-ink">
          {count}
        </span>
      )}
    </button>
  );
}
