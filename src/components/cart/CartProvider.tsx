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
const PROMOS_KEY = "roabrew.combos.v1";

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
  /** Promos que el cliente armó a propósito desde su tarjeta */
  chosenPromos: PromoRule[];
  chooseCombo: (promo: PromoRule) => void;
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
  /**
   * Combos que el cliente armó desde la tarjeta de la promo.
   *
   * Se guardan aparte de las bebidas porque son una intención, no un
   * producto: dicen "quiero el 2x22", y eso es lo que habilita ese precio
   * aunque la promo no esté marcada para cobrarse sola.
   */
  const [chosenPromos, setChosenPromos] = useState<PromoRule[]>([]);

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
    try {
      const raw = localStorage.getItem(PROMOS_KEY);
      if (raw) setChosenPromos(JSON.parse(raw) as PromoRule[]);
    } catch {
      /* combos corruptos: se ignoran */
    }
    setHydrated(true);
  }, []);

  // Guardar en cada cambio
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(PROMOS_KEY, JSON.stringify(chosenPromos));
    } catch {
      /* sin espacio: no es crítico */
    }
  }, [items, chosenPromos, hydrated]);

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
            categoryKind: product.categoryKind,
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

  const chooseCombo = useCallback((promo: PromoRule) => {
    setChosenPromos((prev) =>
      prev.some((p) => p.id === promo.id) ? prev : [...prev, promo]
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setChosenPromos([]);
  }, []);

  // Si el cliente vacía las bebidas de una categoría, su combo deja de
  // tener sentido y se olvida; si no, reaparecería al volver a agregar una.
  useEffect(() => {
    setChosenPromos((prev) => {
      const vigentes = prev.filter((promo) =>
        items.some((i) => i.categorySlug === promo.categorySlug)
      );
      return vigentes.length === prev.length ? prev : vigentes;
    });
  }, [items]);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const pricing = useMemo(
    () =>
      priceCart(
        items.map((i) => ({
          productId: i.productId,
          basePrice: i.price,
          extrasTotal: i.extras.reduce((s, e) => s + e.price, 0),
          quantity: i.quantity,
          categorySlug: i.categorySlug,
          promoEligible: i.promoEligible ?? true,
        })),
        // Primero los que el cliente armó: onePromoPerCategory se queda con
        // el primero de cada categoría, así su elección gana sobre la
        // promo que el panel tenga marcada para cobrarse sola.
        [...chosenPromos, ...promos]
      ),
    [items, promos, chosenPromos]
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
    chosenPromos,
    chooseCombo,
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
