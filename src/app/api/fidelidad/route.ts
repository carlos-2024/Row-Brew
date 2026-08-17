import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isValidDni,
  loyaltyMessage,
  loyaltyStatus,
  maskDni,
  normalizeDni,
  shortName,
} from "@/lib/loyalty";

export const dynamic = "force-dynamic";

/**
 * Freno simple contra la enumeración de documentos. La app corre en un solo
 * contenedor, así que un contador en memoria alcanza; si algún día escala a
 * varias instancias hay que moverlo a Redis.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Limpieza oportunista para que el Map no crezca sin control
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd?.split(",")[0].trim() || "desconocido";
}

// ── Consultar tarjeta ──────────────────────────────────────────
export async function GET(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Espera un momento." },
      { status: 429 }
    );
  }

  const dniRaw = new URL(request.url).searchParams.get("dni") ?? "";
  const dni = normalizeDni(dniRaw);

  if (!isValidDni(dni)) {
    return NextResponse.json(
      { error: "Ingresa un documento válido (8 dígitos para DNI)." },
      { status: 400 }
    );
  }

  try {
    const customer = await prisma.loyaltyCustomer.findUnique({ where: { dni } });

    if (!customer || !customer.active) {
      return NextResponse.json(
        { found: false, error: "No encontramos una tarjeta con ese documento." },
        { status: 404 }
      );
    }

    const status = loyaltyStatus(customer);

    // Solo se devuelve lo mínimo: nunca el nombre completo ni el teléfono.
    return NextResponse.json({
      found: true,
      name: shortName(customer.name),
      dni: maskDni(customer.dni),
      status,
      message: loyaltyMessage(status),
    });
  } catch (error) {
    console.error("[GET /api/fidelidad]", error);
    return NextResponse.json(
      { error: "No pudimos consultar tu tarjeta. Intenta de nuevo." },
      { status: 500 }
    );
  }
}

// ── Registrarse ────────────────────────────────────────────────
export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento." },
      { status: 429 }
    );
  }

  let body: { dni?: string; name?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const dni = normalizeDni(body.dni ?? "");
  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").trim();

  if (!isValidDni(dni)) {
    return NextResponse.json(
      { error: "Ingresa un documento válido (8 dígitos para DNI)." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Ingresa tu nombre." }, { status: 400 });
  }

  try {
    const existing = await prisma.loyaltyCustomer.findUnique({ where: { dni } });
    if (existing) {
      const status = loyaltyStatus(existing);
      return NextResponse.json({
        found: true,
        alreadyExists: true,
        name: shortName(existing.name),
        dni: maskDni(existing.dni),
        status,
        message: loyaltyMessage(status),
      });
    }

    const customer = await prisma.loyaltyCustomer.create({
      data: { dni, name, phone: phone || null },
    });

    const status = loyaltyStatus(customer);
    return NextResponse.json({
      found: true,
      created: true,
      name: shortName(customer.name),
      dni: maskDni(customer.dni),
      status,
      message: "¡Tarjeta creada! Pide tu primer sello en barra.",
    });
  } catch (error) {
    console.error("[POST /api/fidelidad]", error);
    return NextResponse.json(
      { error: "No pudimos crear tu tarjeta. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
