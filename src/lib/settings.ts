import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS: Record<string, string> = {
  brandName: "Roa Brew",
  tagline: "Té · Matcha · Cold Brew",
  heroKicker: "hola brew brew",

  /** Fecha y hora del lanzamiento, para la cuenta regresiva. Zona de Lima. */
  launchDate: "2026-09-18T18:00:00-05:00",
  launchTitle: "¡Hola brew brew!",
  launchSubtitle:
    "Nuestra web está siendo filtrada con mucha paciencia, como nuestro café, y preparada minuciosamente, como nuestro matcha.",
  heroTitle: "Bebidas de autor, pensadas para disfrutar y compartir",
  heroSubtitle: "Matcha, Café y Té seleccionados con intención.",
  whatsapp: "51933948864",
  whatsappDisplay: "933 948 864",
  instagram: "roabrew",
  tiktok: "roabrew",
  location: "Los Olivos — Lima, Perú",
  /** Enlace exacto de Google Maps. Vacío: se arma una búsqueda con `location`. */
  mapsUrl: "",
  schedule: "Mar a Dom · 3:00 pm — 10:00 pm",
  legalName: "ROA BREW E.I.R.L.",
  ruc: "20615866688",
  currency: "S/",
  deliveryNote:
    "Delivery por Yango / InDrive coordinado por WhatsApp. Recojo en nuestro Pop Up House.",

  eventsNote:
    "Ofrecemos una experiencia completa de bebidas para eventos, ferias, Pop Up y corporativos.",
};

export type SiteSettings = typeof DEFAULT_SETTINGS;

/**
 * Lee los ajustes de la base. Si la base no está lista todavía
 * (primer arranque en EasyPanel) devuelve los valores por defecto
 * para que el sitio nunca muestre un error en blanco.
 */
export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const fromDb = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return { ...DEFAULT_SETTINGS, ...fromDb };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Enlace al mapa. Si hay una URL configurada se respeta tal cual; si no, se
 * arma una búsqueda de Google Maps con la dirección escrita en Ajustes.
 */
export function mapsLink(settings: SiteSettings): string {
  const custom = settings.mapsUrl?.trim();
  if (custom) return custom;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${settings.brandName} ${settings.location}`
  )}`;
}

export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, "");
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
