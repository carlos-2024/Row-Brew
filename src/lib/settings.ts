import { prisma } from "@/lib/prisma";

export const DEFAULT_SETTINGS: Record<string, string> = {
  brandName: "Roa Brew",
  tagline: "Té · Matcha · Cold Brew",
  heroKicker: "hola brew brew",
  heroTitle: "Bebidas artesanales que se ven tan bien como saben",
  heroSubtitle:
    "Matcha ceremonial, café de especialidad extraído en frío y té con popping boba. Hechos a mano en Los Olivos, Lima.",
  whatsapp: "51933948864",
  whatsappDisplay: "933 948 864",
  instagram: "roabrew",
  tiktok: "roabrew",
  location: "Los Olivos — Lima, Perú",
  schedule: "Mar a Dom · 3:00 pm — 10:00 pm",
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

export function whatsappLink(phone: string, message?: string): string {
  const clean = phone.replace(/\D/g, "");
  const base = `https://wa.me/${clean}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
