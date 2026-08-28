import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS: Record<string, string> = {
  brandName: "Roa Brew",
  tagline: "Té · Matcha · Cold Brew",
  heroKicker: "hola brew brew",

  /** Fecha y hora del lanzamiento, para la cuenta regresiva. Zona de Lima. */
  launchDate: "2026-09-18T18:00:00-05:00",
  launchTitle: "Estamos preparando algo rico",
  launchSubtitle:
    "Nuestra web está en el horno. Muy pronto vas a poder ver la carta completa y pedir desde acá.",
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

  /** Mapa de zonas de cobertura (Google My Maps). Se acepta cualquier enlace
   *  del mapa: se extrae el identificador automáticamente. */
  deliveryMapUrl:
    "https://www.google.com/maps/d/u/0/viewer?mid=1OWnhQiA5dF75Cmwam3DXfF-ODf6nzJU&ll=-11.99511072509182%2C-77.07136581581635&z=13",
  deliveryZoneFreeLabel: "Zona naranja",
  deliveryZoneFreeText: "Delivery gratis. Sin monto mínimo.",
  deliveryZonePaidLabel: "Zona morada",
  deliveryZonePaidText: "Delivery con costo de S/ 5.",
  deliveryZoneOutsideLabel: "Fuera de zona",
  deliveryZoneOutsideText:
    "También te atendemos: coordinamos el envío por Yango o InDrive y tú asumes la tarifa de la app.",
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

/**
 * Convierte cualquier enlace de Google My Maps en su versión incrustable.
 * Acepta tanto el enlace del visor como uno ya de tipo embed: lo único que
 * importa es el parámetro `mid`. Devuelve null si no hay mapa configurado.
 */
export function deliveryMapEmbedUrl(settings: SiteSettings): string | null {
  const raw = settings.deliveryMapUrl?.trim();
  if (!raw) return null;

  const mid = /[?&]mid=([^&]+)/.exec(raw)?.[1];
  if (!mid) return null;

  // Se conserva el encuadre (centro y zoom) si venía en el enlace original
  const ll = /[?&]ll=([^&]+)/.exec(raw)?.[1];
  const z = /[?&]z=([^&]+)/.exec(raw)?.[1];

  const params = new URLSearchParams({ mid });
  if (ll) params.set("ll", decodeURIComponent(ll));
  if (z) params.set("z", z);

  return `https://www.google.com/maps/d/embed?${params.toString()}`;
}

export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, "");
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
