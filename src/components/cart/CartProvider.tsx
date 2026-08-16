"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartExtra, CartItem, MenuProduct } from "@/lib/types";

const STORAGE_KEY = "roabrew.cart.v1";

type CartContext = {
  items: CartItem[];
  count: number;
  subtotal: number;
  open: boolean;
  lastAdded: string | null;
  setOpen: (v: boolean) => void;
  add: (product: MenuProduct, extras: CartExtra[], quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

function lineKey(productId: string, extras: CartExtra[]): string {
  const sig = [...extras].map((e) => e.name).sort().join("|");
  return sig ? `${productId}::${sig}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Cargar del localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* carrito corrupto: se ignora */
    }
    setHydrated(true);
  }, []);

  // Guardar en cada cambio
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* sin espacio: no es crítico */
    }
  }, [items, hydrated]);

  // Bloquear el scroll del body con el drawer abierto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const add = useCallback(
    (product: MenuProduct, extras: CartExtra[], quantity = 1) => {
      const key = lineKey(product.id, extras);
      setItems((prev) => {
        const found = prev.find((i) => i.key === key);
        if (found) {
          return prev.map((i) =>
            i.key === key ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [
          ...prev,
          {
            key,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            extras,
            categorySlug: product.categorySlug,
          },
        ];
      });
      setLastAdded(product.id);
      window.setTimeout(() => setLastAdded(null), 1200);
    },
    []
  );

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const item of items) {
      const unit = item.price + item.extras.reduce((s, e) => s + e.price, 0);
      count += item.quantity;
      subtotal += unit * item.quantity;
    }
    return { count, subtotal };
  }, [items]);

  const value: CartContext = {
    items,
    count,
    subtotal,
    open,
    lastAdded,
    setOpen,
    add,
    setQuantity,
    remove,
    clear,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}

export function unitPrice(item: CartItem): number {
  return item.price + item.extras.reduce((s, e) => s + e.price, 0);
}
