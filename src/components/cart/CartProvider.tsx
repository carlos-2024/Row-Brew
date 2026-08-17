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
import { priceCart, type PriceBreakdown, type PromoRule } from "@/lib/pricing";

const STORAGE_KEY = "roabrew.cart.v1";

type CartContext = {
  items: CartItem[];
  count: number;
  /** Todo a precio de lista */
  subtotal: number;
  /** Desglose con promociones aplicadas */
  pricing: PriceBreakdown;
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

export function CartProvider({
  children,
  promos = [],
}: {
  children: ReactNode;
  promos?: PromoRule[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Cargar del localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // Los carritos guardados antes de que existieran las promos no traen
        // promoEligible; se asume que sí entran.
        const saved = JSON.parse(raw) as CartItem[];
        setItems(saved.map((i) => ({ ...i, promoEligible: i.promoEligible ?? true })));
      }
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
            promoEligible: product.promoEligible,
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

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const pricing = useMemo(
    () =>
      priceCart(
        items.map((i) => ({
          basePrice: i.price,
          extrasTotal: i.extras.reduce((s, e) => s + e.price, 0),
          quantity: i.quantity,
          categorySlug: i.categorySlug,
          promoEligible: i.promoEligible ?? true,
        })),
        promos
      ),
    [items, promos]
  );

  const value: CartContext = {
    items,
    count,
    subtotal: pricing.subtotal,
    pricing,
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
