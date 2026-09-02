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
  /** Enlace de Waze. Vacío: se arma una búsqueda con `location`. */
  wazeUrl: "",

  /** Mapa de zonas de cobertura (Google My Maps). De ahí se leen los
   *  polígonos con los que el carrito decide el costo del envío. */
  deliveryMapUrl:
    "https://www.google.com/maps/d/u/0/viewer?mid=1OWnhQiA5dF75Cmwam3DXfF-ODf6nzJU&ll=-11.99511072509182%2C-77.07136581581635&z=13",
  /** Costo del envío cuando la dirección cae en la zona con cargo */
  deliveryFeePaid: "5",
  deliveryTextFree: "¡Tu zona tiene delivery gratis!",
  deliveryTextPaid: "Llegamos a tu zona con un costo de envío.",
  deliveryTextOutside:
    "Estás fuera de nuestras zonas, pero igual te atendemos: el envío lo gestiona un driver y te avisamos el costo antes de preparar tu pedido.",
  schedule: "Mar a Dom · 3:00 pm — 10:00 pm",
  legalName: "ROA BREW E.I.R.L.",
  ruc: "20615866688",
  currency: "S/",
  deliveryNote:
    "Delivery por Yango / InDrive coordinado por WhatsApp. Recojo en nuestro Pop Up House.",

  /** Opciones del desplegable del formulario de eventos, separadas por coma. */
  eventTypes:
    "Cumpleaños, Corporativo, Feria o activación, Matrimonio, Baby shower, Otro",
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

/** Enlace de navegación en Waze, con el mismo criterio que el de Maps. */
export function wazeLink(settings: SiteSettings): string {
  const custom = settings.wazeUrl?.trim();
  if (custom) return custom;
  return `https://waze.com/ul?q=${encodeURIComponent(
    `${settings.brandName} ${settings.location}`
  )}&navigate=yes`;
}

export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, "");
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
