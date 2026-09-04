import type { Metadata } from "next";

/**
 * Metadatos y datos estructurados del sitio.
 *
 * Todo lo que se le muestra a un buscador sale de acá. Se centraliza porque
 * las reglas son las mismas en cada página — recortar a lo que Google muestra,
 * caer en el texto del cliente cuando no hay uno escrito a mano, y construir
 * siempre URLs absolutas — y repetirlas en cada `generateMetadata` garantizaba
 * que tarde o temprano una quedara distinta.
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

/** Google recorta el título alrededor de los 60 caracteres. */
const MAX_TITLE = 60;
/** Y la descripción alrededor de los 155. */
const MAX_DESC = 155;

/** El sitio está en modo lanzamiento: nada debe indexarse todavía. */
export function comingSoon(): boolean {
  const flag = process.env.COMING_SOON?.trim().toLowerCase();
  return flag === "true" || flag === "1";
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Recorta sin partir una palabra por la mitad.
 *
 * Google corta igual, pero lo hace a mitad de palabra y con puntos suspensivos
 * suyos; llegar ya recortado deja el final bajo nuestro control.
 */
export function trim(texto: string, max: number): string {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max - 1);
  const espacio = corte.lastIndexOf(" ");
  return `${(espacio > max * 0.6 ? corte.slice(0, espacio) : corte).trim()}…`;
}

export type SeoFields = {
  metaTitle: string | null;
  metaDescription: string | null;
  seoKeywords: string | null;
  imageAlt: string | null;
};

/** Palabras clave escritas como "una, otra, otra más". */
export function parseKeywords(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((k) => k.trim()).filter(Boolean))];
}

/**
 * Arma los metadatos de una página.
 *
 * `noIndex` no es solo para el modo lanzamiento: un producto apagado sigue
 * teniendo URL — se puede llegar por un enlace viejo — y no queremos que
 * Google lo ofrezca como resultado.
 */
export function buildMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  path,
  image,
  noIndex = false,
  type = "website",
}: {
  seo?: Partial<SeoFields> | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article";
}): Metadata {
  // Un título escrito a mano se respeta tal cual: el layout añade "· Roa
  // Brew" a todo, y quien escribe "… | Roa Brew" terminaba con la marca
  // repetida y pasado de los 60 caracteres.
  const propio = seo?.metaTitle?.trim();
  const title = trim(propio || fallbackTitle, MAX_TITLE);
  const description = trim(
    seo?.metaDescription?.trim() || fallbackDescription,
    MAX_DESC
  );
  const url = absoluteUrl(path);
  const keywords = parseKeywords(seo?.seoKeywords);

  // Mientras el sitio no esté abierto no hay nada que indexar, y un producto
  // apagado tampoco debería aparecer en resultados
  const bloquear = noIndex || comingSoon();

  const imagenes = image
    ? [{ url: image, alt: seo?.imageAlt?.trim() || title }]
    : undefined;

  return {
    title: propio ? { absolute: title } : title,
    description,
    ...(keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: url },
    robots: bloquear
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      locale: "es_PE",
      siteName: "Roa Brew",
      url,
      title,
      description,
      ...(imagenes ? { images: imagenes } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/**
 * Ficha Product + Offer de schema.org.
 *
 * Es lo que permite que un resultado muestre precio y disponibilidad. El
 * precio va como cadena con dos decimales porque schema.org lo pide así, y
 * `priceValidUntil` evita que Google marque la oferta como caducada.
 */
export function productJsonLd({
  name,
  description,
  image,
  url,
  price,
  currency,
  available,
  brand = "Roa Brew",
  category,
  sku,
}: {
  name: string;
  description: string;
  image?: string | null;
  url: string;
  price: number;
  currency: string;
  available: boolean;
  brand?: string;
  category?: string;
  sku?: string;
}) {
  const dentroDeUnAno = new Date();
  dentroDeUnAno.setFullYear(dentroDeUnAno.getFullYear() + 1);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    ...(image ? { image: [image] } : {}),
    ...(sku ? { sku } : {}),
    ...(category ? { category } : {}),
    brand: { "@type": "Brand", name: brand },
    offers: {
      "@type": "Offer",
      url,
      // PEN y no "S/": schema.org exige el código ISO 4217
      priceCurrency: currency,
      price: price.toFixed(2),
      priceValidUntil: dentroDeUnAno.toISOString().slice(0, 10),
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Roa Brew" },
    },
  };
}

/** Migas de pan: le dicen a Google dónde encaja la página dentro del sitio. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * La moneda como la quiere schema.org.
 *
 * En los ajustes se guarda "S/" porque es lo que se le muestra al cliente,
 * pero en los datos estructurados hay que mandar el código ISO.
 */
export function isoCurrency(simbolo: string): string {
  const s = simbolo.trim().toUpperCase();
  if (s === "S/" || s === "S/." || s === "PEN") return "PEN";
  if (s === "$" || s === "USD") return "USD";
  if (s === "€" || s === "EUR") return "EUR";
  return s.replace(/[^A-Z]/g, "").slice(0, 3) || "PEN";
}
