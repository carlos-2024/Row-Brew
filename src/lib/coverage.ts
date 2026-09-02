/**
 * Zonas de cobertura de delivery.
 *
 * Los polígonos se leen del propio mapa de Google My Maps (su KML), así que
 * la fuente de verdad sigue siendo el mapa: si se redibuja una zona allá, esto
 * la toma sin tocar código.
 */

export type Zone = {
  /** Nombre de la capa en el mapa */
  name: string;
  /** true si es la zona de envío gratuito */
  free: boolean;
  /** Anillos de coordenadas [lng, lat] */
  rings: [number, number][][];
};

export type CoverageResult =
  | { status: "gratis"; zone: string }
  | { status: "costo"; zone: string }
  | { status: "fuera" };

/** Cuánto se cachea el KML antes de volver a pedirlo a Google (segundos). */
const KML_TTL = 600;

function kmlUrl(mapUrl: string): string | null {
  const mid = /[?&]mid=([^&]+)/.exec(mapUrl)?.[1];
  return mid ? `https://www.google.com/maps/d/kml?mid=${mid}&forcekml=1` : null;
}

/**
 * Parser mínimo de KML de My Maps. La estructura que genera Google es
 * estable y muy simple (Folder → Placemark → Polygon), así que no vale la
 * pena arrastrar una librería de XML.
 */
export function parseKml(kml: string): Zone[] {
  const zones: Zone[] = [];

  for (const folder of kml.match(/<Folder>[\s\S]*?<\/Folder>/g) ?? []) {
    const name = /<name>([^<]*)<\/name>/.exec(folder)?.[1]?.trim() ?? "Zona";

    const rings: [number, number][][] = [];
    for (const block of folder.match(/<coordinates>[\s\S]*?<\/coordinates>/g) ?? []) {
      const ring = block
        .replace(/<\/?coordinates>/g, "")
        .trim()
        .split(/\s+/)
        .map((p) => {
          const [lng, lat] = p.split(",").map(Number);
          return [lng, lat] as [number, number];
        })
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

      if (ring.length >= 3) rings.push(ring);
    }

    if (rings.length > 0) {
      zones.push({ name, free: /gratis|gratuit|free/i.test(name), rings });
    }
  }

  return zones;
}

export async function getZones(mapUrl: string): Promise<Zone[]> {
  const url = kmlUrl(mapUrl);
  if (!url) return [];

  try {
    const res = await fetch(url, {
      next: { revalidate: KML_TTL },
      headers: { "User-Agent": "RoaBrew/1.0 (+https://roabrew.com)" },
    });
    if (!res.ok) return [];
    return parseKml(await res.text());
  } catch {
    return [];
  }
}

/**
 * Punto en polígono por lanzamiento de rayo. Devuelve true si (lat,lng) cae
 * dentro del anillo. Las coordenadas del anillo vienen como [lng, lat].
 */
export function pointInRing(
  lat: number,
  lng: number,
  ring: [number, number][]
): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const cruza = yi > lat !== yj > lat;
    if (cruza && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

export function pointInZone(lat: number, lng: number, zone: Zone): boolean {
  return zone.rings.some((ring) => pointInRing(lat, lng, ring));
}

/**
 * Clasifica una coordenada.
 *
 * La zona gratuita se evalúa primero a propósito: en el mapa de Roa Brew está
 * contenida dentro de la de costo, así que si se revisara al revés todo el
 * mundo caería en la de 5 soles.
 */
export function classify(lat: number, lng: number, zones: Zone[]): CoverageResult {
  const free = zones.find((z) => z.free && pointInZone(lat, lng, z));
  if (free) return { status: "gratis", zone: free.name };

  const paid = zones.find((z) => !z.free && pointInZone(lat, lng, z));
  if (paid) return { status: "costo", zone: paid.name };

  return { status: "fuera" };
}
