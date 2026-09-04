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
  /** bebida | comida | postre, heredado de su familia */
  categoryKind: string;
  /** Grupos de opcionales propios. Ausente: solo los extras sueltos. */
  extraGroups?: MenuExtraGroup[];
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  theme: string;
  emoji: string;
  /** bebida | comida | postre */
  kind: string;
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
  /** ── SEO ── lo que ve el buscador, aparte de lo que ve el cliente */
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string | null;
  imageAlt: string | null;
};

export type MenuExtra = {
  id: string;
  name: string;
  price: number;
};

/** Grupo de opcionales que ofrece un producto: "Leche", "Boba"… */
export type MenuExtraGroup = {
  id: string;
  name: string;
  hint: string | null;
  /** 0 es sin límite; 1 hace que elegir una desmarque la anterior */
  maxChoices: number;
  extras: MenuExtra[];
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
  /** Para dibujarlo bien en el carrito sin volver a consultar la carta */
  categoryKind: string;
  promoEligible: boolean;
};
