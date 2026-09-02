import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { eventCode, toIsoDate, toUtcDate, todayUtc } from "@/lib/events";

export const dynamic = "force-dynamic";

/** Fechas no disponibles, para pintar el calendario del formulario. */
export async function GET() {
  try {
    const desde = todayUtc();

    const [bloqueadas, confirmados] = await Promise.all([
      prisma.blockedDate.findMany({ where: { date: { gte: desde } } }),
      // Un evento ya confirmado también ocupa el día
      prisma.eventRequest.findMany({
        where: { status: "CONFIRMADO", eventDate: { gte: desde } },
        select: { eventDate: true },
      }),
    ]);

    const fechas = [
      ...bloqueadas.map((b) => toIsoDate(b.date)),
      ...confirmados.map((c) => toIsoDate(c.eventDate)),
    ];

    return NextResponse.json({ blocked: [...new Set(fechas)] });
  } catch {
    return NextResponse.json({ blocked: [] });
  }
}

/** Recibe una solicitud de cotización. */
export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    phone?: string;
    eventDate?: string;
    eventType?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const eventType = (body.eventType ?? "").trim();
  const eventDate = toUtcDate(body.eventDate ?? "");

  if (name.length < 3) {
    return NextResponse.json({ error: "Ingresa tu nombre completo." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Ingresa un correo válido." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 9) {
    return NextResponse.json(
      { error: "Ingresa un WhatsApp válido de 9 dígitos." },
      { status: 400 }
    );
  }
  if (!eventDate) {
    return NextResponse.json({ error: "Elige la fecha del evento." }, { status: 400 });
  }
  if (eventDate < todayUtc()) {
    return NextResponse.json(
      { error: "La fecha del evento no puede ser en el pasado." },
      { status: 400 }
    );
  }
  if (!eventType) {
    return NextResponse.json({ error: "Elige el tipo de evento." }, { status: 400 });
  }

  try {
    // Se revalida la disponibilidad en el servidor: entre que se cargó el
    // calendario y se envió el formulario, el día pudo bloquearse.
    const [bloqueada, confirmado] = await Promise.all([
      prisma.blockedDate.findUnique({ where: { date: eventDate } }),
      prisma.eventRequest.findFirst({
        where: { eventDate, status: "CONFIRMADO" },
      }),
    ]);

    if (bloqueada || confirmado) {
      return NextResponse.json(
        { error: "Esa fecha acaba de ocuparse. Elige otra, por favor." },
        { status: 409 }
      );
    }

    const solicitud = await prisma.eventRequest.create({
      data: {
        code: eventCode(),
        name,
        email,
        phone,
        eventDate,
        eventType,
        notes: (body.notes ?? "").trim() || null,
      },
    });

    return NextResponse.json({ code: solicitud.code });
  } catch (error) {
    console.error("[POST /api/eventos]", error);
    return NextResponse.json(
      { error: "No pudimos registrar tu solicitud. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
