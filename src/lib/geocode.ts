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

/**
 * Varias sugerencias para el buscador predictivo del carrito.
 *
 * A diferencia de `geocode`, que devuelve la mejor coincidencia, aquí se
 * ofrecen opciones para que el cliente elija la suya: es la forma de obtener
 * coordenadas exactas sin depender de que escriba la dirección perfecta.
 */
export async function suggest(query: string, limit = 5): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (q.length < 4) return [];

  const full = /lima|per[uú]/i.test(q) ? q : `${q}, Lima, Perú`;

  const params = new URLSearchParams({
    q: full,
    format: "jsonv2",
    limit: String(Math.min(limit, 8)),
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
    if (!res.ok) return [];

    const data = (await res.json()) as {
      lat: string;
      lon: string;
      display_name: string;
      place_rank?: number;
      address?: { house_number?: string };
    }[];

    return data.map((d) => ({
      lat: Number(d.lat),
      lng: Number(d.lon),
      label: d.display_name,
      precise: Boolean(d.address?.house_number) || (d.place_rank ?? 0) >= 30,
    }));
  } catch {
    return [];
  }
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

/**
 * Autocompletado en vivo con Photon (OpenStreetMap).
 *
 * Nominatim limita a una consulta por segundo, lo que obliga a esperar entre
 * pulsaciones y se siente lento. Photon está pensado justamente para escribir
 * y ver resultados al vuelo. Si falla, se cae a Nominatim para no quedarse sin
 * sugerencias.
 */
const PHOTON = "https://photon.komoot.io/api/";

/** Centro aproximado de Lima, para que priorice resultados cercanos. */
const LIMA_LAT = -12.05;
const LIMA_LNG = -77.05;

/**
 * Recuadro de Lima y Callao (minLon,minLat,maxLon,maxLat).
 *
 * El sesgo por coordenadas ordena pero no descarta: sin esto, escribir
 * "jr huan" traía calles de Huánuco y Huancavelica. Como solo se reparte en
 * Lima, acotar aquí deja la lista limpia.
 */
const LIMA_BBOX = "-77.30,-12.55,-76.60,-11.50";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    locality?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
};

/** Arma una dirección legible con las partes que Photon devuelve sueltas. */
function etiquetaPhoton(p: PhotonFeature["properties"]): string {
  const calle = [p.street ?? p.name, p.housenumber].filter(Boolean).join(" ");
  const zona = [p.locality, p.district, p.city ?? p.county, p.state].filter(Boolean);
  // Se quitan repetidos: Photon suele repetir el distrito en city
  const unicos = [...new Set(zona)];
  return [calle || p.name, ...unicos].filter(Boolean).join(", ");
}

export async function suggestFast(query: string, limit = 5): Promise<GeocodeHit[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const params = new URLSearchParams({
    q,
    // Se piden de más porque una misma calle llega partida en varios tramos
    // y al unificarlos quedan menos de los que se van a mostrar
    limit: String(Math.min(limit * 4, 30)),
    // Photon solo acepta default, de, en y fr: con "es" responde un error
    lang: "default",
    lat: String(LIMA_LAT),
    lon: String(LIMA_LNG),
    bbox: LIMA_BBOX,
  });

  try {
    const res = await fetch(`${PHOTON}?${params}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error("photon no disponible");

    const data = (await res.json()) as { features?: PhotonFeature[] };

    // OSM parte una avenida larga en muchos tramos y Photon devuelve uno por
    // tramo, así que la misma dirección aparecería repetida. Se deja el primero
    // de cada etiqueta, que es además el que Photon consideró más relevante.
    const vistos = new Set<string>();
    const hits: GeocodeHit[] = [];

    for (const f of data.features ?? []) {
      // Solo Perú: el sesgo por coordenadas no lo garantiza
      if (f.properties.countrycode && f.properties.countrycode !== "PE") continue;

      const label = etiquetaPhoton(f.properties);
      if (!label) continue;

      const clave = label.toLowerCase();
      if (vistos.has(clave)) continue;
      vistos.add(clave);

      hits.push({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        label,
        precise: Boolean(f.properties.housenumber),
      });

      if (hits.length >= limit) break;
    }

    if (hits.length > 0) return hits;
    throw new Error("sin resultados");
  } catch {
    // Respaldo: más lento, pero mejor que dejar al cliente sin sugerencias
    return suggest(q, limit);
  }
}
