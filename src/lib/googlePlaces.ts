/**
 * Google Places API (New): autocompletado de direcciones y coordenadas.
 *
 * Se usa en lugar de OpenStreetMap porque en Lima OSM no tiene la numeración
 * de casi ninguna calle ni muchos nombres oficiales: direcciones que Google
 * Maps encuentra al instante no aparecían en el carrito.
 *
 * El flujo está partido en dos a propósito, para pagar lo mínimo:
 *
 *   1. Mientras el cliente escribe, solo Autocomplete. Devuelve sugerencias
 *      pero no coordenadas.
 *   2. Cuando elige una, un único Place Details para sacar las coordenadas.
 *
 * Las dos llamadas viajan con el mismo token de sesión. Google agrupa las
 * consultas de una sesión que termina en un Details y no cobra cada tecla por
 * separado. Pedir el detalle de las cinco sugerencias en cada tecla —que es lo
 * que haría falta para mostrar la zona de envío antes de elegir— multiplicaba
 * el costo por cinco en cada pulsación.
 *
 * Este archivo no importa nada del proyecto para poder probarse suelto.
 */

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_URL = "https://places.googleapis.com/v1/places/";

/**
 * Recuadro de Lima y Callao. Es una restricción, no una preferencia: solo se
 * reparte ahí, y ofrecer una calle homónima de Arequipa confunde al cliente.
 */
const LIMA = {
  low: { latitude: -12.55, longitude: -77.3 },
  high: { latitude: -11.5, longitude: -76.6 },
};

/**
 * Campos del detalle. Se piden solo los del nivel básico de Google: con
 * cualquier otro (horarios, fotos, reseñas) la consulta pasa a una tarifa más
 * cara, y para ubicar una dirección no hace falta nada más.
 */
const DETAILS_FIELDS = "id,formattedAddress,location,addressComponents,types";

export type PlaceSuggestion = {
  placeId: string;
  /** Texto completo, p. ej. "Jr. Manuel Rivero 389, Los Olivos, Perú" */
  label: string;
  /** La parte principal: calle y número */
  main: string;
  /** El resto: distrito, ciudad */
  secondary: string;
};

export type PlaceLocation = {
  placeId: string;
  label: string;
  lat: number;
  lng: number;
  /** true si Google ubicó el número de puerta y no solo la calle */
  precise: boolean;
};

/** Error de Google con su código, para dejar en los logs algo accionable. */
export class GooglePlacesError extends Error {
  status: number;
  reason: string | null;

  constructor(message: string, status: number, reason: string | null) {
    super(message);
    this.name = "GooglePlacesError";
    this.status = status;
    this.reason = reason;
  }
}

/** La clave, si está configurada. Sin ella el buscador usa OpenStreetMap. */
export function googleKey(): string | null {
  const k = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return k ? k : null;
}

/** Los id de Google son base64 URL-safe: nada que pueda alterar la ruta. */
export function isPlaceId(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_-]{10,300}$/.test(v);
}

/** Token de sesión: Google acepta hasta 36 caracteres URL-safe. */
export function isSessionToken(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_-]{8,36}$/.test(v);
}

/** "…, Perú" no le dice nada a quien vive en Lima y alarga la sugerencia. */
function sinPais(texto: string): string {
  return texto.replace(/,\s*Per[uú]\s*$/i, "").trim();
}

async function leerError(res: Response): Promise<GooglePlacesError> {
  let reason: string | null = null;
  let message = `Google Places respondió ${res.status}`;
  try {
    const body = (await res.json()) as {
      error?: { message?: string; status?: string };
    };
    if (body.error?.message) message = body.error.message;
    reason = body.error?.status ?? null;
  } catch {
    /* sin cuerpo legible: queda el código HTTP */
  }
  return new GooglePlacesError(message, res.status, reason);
}

type AutocompleteBody = {
  suggestions?: {
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }[];
};

/** Separado de la llamada para poder probarlo con respuestas de ejemplo. */
export function parseAutocomplete(body: AutocompleteBody): PlaceSuggestion[] {
  const vistos = new Set<string>();
  const out: PlaceSuggestion[] = [];

  for (const s of body.suggestions ?? []) {
    const p = s.placePrediction;
    if (!p || !isPlaceId(p.placeId) || vistos.has(p.placeId)) continue;
    vistos.add(p.placeId);

    const main = p.structuredFormat?.mainText?.text?.trim() ?? "";
    const secondary = sinPais(p.structuredFormat?.secondaryText?.text ?? "");
    const label = sinPais(p.text?.text ?? [main, secondary].filter(Boolean).join(", "));
    if (!label) continue;

    out.push({ placeId: p.placeId, label, main: main || label, secondary });
  }

  return out;
}

export async function autocomplete(
  input: string,
  sessionToken: string | null,
  key: string
): Promise<PlaceSuggestion[]> {
  const res = await fetch(AUTOCOMPLETE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
    },
    body: JSON.stringify({
      input,
      languageCode: "es",
      regionCode: "pe",
      locationRestriction: { rectangle: LIMA },
      ...(sessionToken ? { sessionToken } : {}),
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw await leerError(res);
  return parseAutocomplete((await res.json()) as AutocompleteBody);
}

type DetailsBody = {
  id?: string;
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  addressComponents?: { types?: string[] }[];
  types?: string[];
};

export function parseDetails(body: DetailsBody, placeId: string): PlaceLocation | null {
  const lat = body.location?.latitude;
  const lng = body.location?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const conNumero = (body.addressComponents ?? []).some((c) =>
    c.types?.includes("street_number")
  );
  const esPuerta = (body.types ?? []).some((t) =>
    ["street_address", "premise", "subpremise"].includes(t)
  );

  return {
    placeId: body.id ?? placeId,
    label: sinPais(body.formattedAddress ?? ""),
    lat,
    lng,
    precise: conNumero || esPuerta,
  };
}

/**
 * Las coordenadas de un lugar ya elegido se guardan un día. El mismo cliente
 * suele volver a pedir a la misma dirección, y un Details repetido se cobra
 * igual que el primero.
 */
const cacheDetalle = new Map<string, { valor: PlaceLocation; hasta: number }>();
const UN_DIA = 24 * 60 * 60 * 1000;

export async function placeDetails(
  placeId: string,
  sessionToken: string | null,
  key: string
): Promise<PlaceLocation | null> {
  const guardado = cacheDetalle.get(placeId);
  if (guardado && guardado.hasta > Date.now()) return guardado.valor;

  const params = new URLSearchParams({ languageCode: "es", regionCode: "pe" });
  if (sessionToken) params.set("sessionToken", sessionToken);

  const res = await fetch(`${DETAILS_URL}${encodeURIComponent(placeId)}?${params}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": DETAILS_FIELDS,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw await leerError(res);
  const valor = parseDetails((await res.json()) as DetailsBody, placeId);

  if (valor) {
    if (cacheDetalle.size > 2000) cacheDetalle.clear();
    cacheDetalle.set(placeId, { valor, hasta: Date.now() + UN_DIA });
  }
  return valor;
}
