export type MenuProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  badge: string | null;
  size: string | null;
  featured: boolean;
  promoEligible: boolean;
  categorySlug: string;
  categoryName: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  theme: string;
  emoji: string;
  products: MenuProduct[];
};

export type AllyImageView = {
  id: string;
  url: string;
  caption: string | null;
};

/** Lo mínimo para la tarjeta del inicio. */
export type AllySummary = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  /** Productos activos de la marca, para anunciarlo en la tarjeta */
  productCount: number;
};

export type AllyView = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  storyTitle: string | null;
  story: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  images: AllyImageView[];
  products: MenuProduct[];
};

export type MenuExtra = {
  id: string;
  name: string;
  price: number;
};

export type PromoView = {
  id: string;
  title: string;
  label: string;
  detail: string | null;
  price: number;
  /** Cuántas bebidas entran en el combo */
  quantity: number;
  /** Si el carrito la cobra sola: solo entonces se ofrece armarla */
  autoApply: boolean;
  theme: string;
  imageUrl: string | null;
  categorySlug: string | null;
  /** Bebidas entre las que puede elegir el cliente. Vacío si no es armable. */
  products: MenuProduct[];
};

export type CartExtra = { name: string; price: number };

export type CartItem = {
  /** id único de la línea: productId + extras */
  key: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  extras: CartExtra[];
  categorySlug: string;
  promoEligible: boolean;
};
