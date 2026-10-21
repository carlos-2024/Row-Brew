import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/format";
import {
  eventoPublicado,
  getSettings,
  pedidosEventoActivos,
} from "@/lib/settings";

export const dynamic = "force-dynamic";

/** Número corto, del estilo E-7K2. Se canta en voz alta en la barra. */
function numeroCorto(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 3; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `E-${out}`;
}

type ItemEntrante = { id?: string; quantity?: number };

/**
 * Pedido hecho desde la carta del evento.
 *
 * No pasa por `/api/orders` ni por WhatsApp: en una feria el cliente está a
 * dos metros de la barra y lo que hace falta es que el pedido aparezca en la
 * pantalla de quien prepara, con un número que cantar.
 *
 * Los precios se leen de la base, nunca del navegador, igual que en el
 * carrito del local.
 */
export async function POST(request: Request) {
  try {
    const settings = await getSettings();

    // La misma puerta que la página: con el evento apagado no se reciben
    // pedidos aunque alguien tenga la pestaña abierta desde ayer
    if (!eventoPublicado(settings) || !pedidosEventoActivos(settings)) {
      return NextResponse.json(
        { error: "Los pedidos del evento están cerrados." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const customerName = String(body?.customerName ?? "").trim().slice(0, 80);
    if (customerName.length < 2) {
      return NextResponse.json(
        { error: "Déjanos tu nombre para cantarte el pedido." },
        { status: 400 }
      );
    }

    const entrantes: ItemEntrante[] = Array.isArray(body?.items) ? body.items : [];
    if (entrantes.length === 0 || entrantes.length > 40) {
      return NextResponse.json({ error: "Tu pedido está vacío." }, { status: 400 });
    }

    const productos = await prisma.eventProduct.findMany({
      where: {
        id: { in: [...new Set(entrantes.map((i) => String(i.id)))] },
        active: true,
      },
    });
    const porId = new Map(productos.map((p) => [p.id, p]));

    const lineas = entrantes.flatMap((i) => {
      const p = porId.get(String(i.id));
      if (!p) return [];
      const quantity = Math.max(1, Math.min(20, Math.floor(Number(i.quantity) || 1)));
      const unitPrice = toNumber(p.price);
      return [{ name: p.name, unitPrice, quantity, lineTotal: unitPrice * quantity }];
    });

    if (lineas.length === 0) {
      return NextResponse.json(
        { error: "Esos productos ya no están en la carta." },
        { status: 400 }
      );
    }

    const total = lineas.reduce((s, l) => s + l.lineTotal, 0);

    // Reintento por si dos personas sacan el mismo número a la vez: son solo
    // tres caracteres y en una feria llena el choque deja de ser improbable
    let pedido = null;
    for (let intento = 0; intento < 5 && !pedido; intento++) {
      try {
        pedido = await prisma.eventOrder.create({
          data: {
            code: numeroCorto(),
            customerName,
            phone: String(body?.phone ?? "").trim().slice(0, 30) || null,
            note: String(body?.note ?? "").trim().slice(0, 300) || null,
            total,
            items: { create: lineas },
          },
        });
      } catch {
        /* código repetido: se prueba otro */
      }
    }

    if (!pedido) {
      return NextResponse.json(
        { error: "No pudimos registrar tu pedido. Inténtalo otra vez." },
        { status: 500 }
      );
    }

    return NextResponse.json({ code: pedido.code, total });
  } catch {
    return NextResponse.json(
      { error: "No pudimos registrar tu pedido. Inténtalo otra vez." },
      { status: 500 }
    );
  }
}
