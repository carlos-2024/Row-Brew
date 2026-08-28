/**
 * Dirección → coordenadas, usando Nominatim (OpenStreetMap).
 *
 * Se eligió Nominatim porque no exige clave de API ni facturación. A cambio
 * hay que respetar su política de uso: identificarse con un User-Agent real,
 * no superar una consulta por segundo y cachear los resultados. Las tres cosas
 * están implementadas aquí.
 */

export type GeocodeHit = {
  lat: number;
  lng: number;
  /** Dirección normalizada tal como la entendió el geocodificador */
  label: string;
  /**
   * true solo si acertó al portal exacto. Cuando es false lo que devolvió es
   * el centro de la calle o del barrio, que puede caer en otra zona: hay que
   * avisarle al cliente en vez de darle un resultado tajante.
   */
  precise: boolean;
};

const ENDPOINT = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "RoaBrew/1.0 (pedidos web; contacto: hola@roabrew.com)";

/** Encuadre de Lima Metropolitana para priorizar resultados locales. */
const LIMA_VIEWBOX = "-77.25,-11.70,-76.80,-12.30";

const cache = new Map<string, { hit: GeocodeHit | null; at: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // un día

let lastCall = 0;
const MIN_GAP_MS = 1100; // la política pide máximo 1 consulta por segundo

async function respetarRitmo() {
  const espera = lastCall + MIN_GAP_MS - Date.now();
  if (espera > 0) await new Promise((r) => setTimeout(r, espera));
  lastCall = Date.now();
}

export async function geocode(address: string): Promise<GeocodeHit | null> {
  const query = address.trim().toLowerCase();
  if (query.length < 4) return null;

  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < CACHE_TTL) return cached.hit;

  // Se agrega la ciudad si el usuario no la escribió, que es lo habitual
  const full = /lima|per[uú]/i.test(query) ? address : `${address}, Lima, Perú`;

  const params = new URLSearchParams({
    q: full,
    format: "jsonv2",
    limit: "1",
    countrycodes: "pe",
    viewbox: LIMA_VIEWBOX,
    addressdetails: "1",
    "accept-language": "es",
  });

  try {
    await respetarRitmo();

    const res = await fetch(`${ENDPOINT}?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      place_rank?: number;
      address?: { house_number?: string };
    }[];

    const first = data?.[0];
    const hit = first
      ? {
          lat: Number(first.lat),
          lng: Number(first.lon),
          label: first.display_name,
          // place_rank 30 es nivel de edificio; con número de portal también vale
          precise:
            Boolean(first.address?.house_number) || (first.place_rank ?? 0) >= 30,
        }
      : null;

    if (cache.size > 1000) cache.clear();
    cache.set(query, { hit, at: Date.now() });

    return hit;
  } catch {
    return null;
  }
}
