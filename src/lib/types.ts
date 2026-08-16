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
  theme: string;
  imageUrl: string | null;
  categorySlug: string | null;
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
};
