import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderCode, toNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { getAutoPromos, getPromoRulesByIds } from "@/lib/menu";
import { priceCart, type PriceableItem } from "@/lib/pricing";
import { classify, getZones } from "@/lib/coverage";
import { eventCode, toUtcDate, todayUtc } from "@/lib/events";
import type { DocType } from "@prisma/client";

export const dynamic = "force-dynamic";

type IncomingItem = {
  productId: string;
  quantity: number;
  extras?: { name: string }[];
};

type Body = {
  customerName?: string;
  phone?: string;
  deliveryType?: string;
  address?: string;
  lat?: number;
  lng?: number;
  scheduledFor?: string;
  notes?: string;
  docType?: string;
  docNumber?: string;
  businessName?: string;
  email?: string;
  eventDate?: string;
  eventType?: string;
  items?: IncomingItem[];
  /** Promos que el cliente armó desde su tarjeta, solo los identificadores */
  promoIds?: string[];
};

const DELIVERY_TEXT: Record<string, string> = {
  recojo: "Recojo en el Pop Up",
  delivery: "Delivery",
  evento: "Evento / corporativo",
};

const DOC_TEXT: Record<string, string> = {
  BOLETA: "Boleta simple",
  BOLETA_DNI: "Boleta con DNI",
  FACTURA: "Factura",
};

const ZONA_TEXT: Record<string, string> = {
  gratis: "Zona con delivery gratis",
  costo: "Zona con costo de envío",
  fuera: "Fuera de zona: el envío lo gestiona un driver y se avisa el costo antes",
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const customerName = (body.customerName ?? "").trim();
  const phone = (body.phone ?? "").trim();
  const deliveryType = body.deliveryType ?? "recojo";
  const items = body.items ?? [];

  const docType = (
    ["BOLETA", "BOLETA_DNI", "FACTURA"].includes(body.docType ?? "")
      ? body.docType
      : "BOLETA"
  ) as DocType;
  const docNumber = (body.docNumber ?? "").replace(/\D/g, "");
  const businessName = (body.businessName ?? "").trim();

  // ── Validaciones ──────────────────────────────────────────
  if (!customerName || phone.replace(/\D/g, "").length < 6) {
    return NextResponse.json(
      { error: "Necesitamos tu nombre y un número de contacto válido." },
      { status: 400 }
    );
  }
  if (items.length === 0) {
    return NextResponse.json({ error: "Tu carrito está vacío." }, { status: 400 });
  }
  if (deliveryType === "delivery" && !(body.address ?? "").trim()) {
    return NextResponse.json(
      { error: "Elige tu dirección para calcular el envío." },
      { status: 400 }
    );
  }
  if (docType === "BOLETA_DNI" && docNumber.length !== 8) {
    return NextResponse.json({ error: "El DNI debe tener 8 dígitos." }, { status: 400 });
  }
  if (docType === "FACTURA") {
    if (docNumber.length !== 11) {
      return NextResponse.json({ error: "El RUC debe tener 11 dígitos." }, { status: 400 });
    }
    if (!businessName) {
      return NextResponse.json(
        { error: "Ingresa la razón social para la factura." },
        { status: 400 }
      );
    }
  }

  const eventDate = toUtcDate(body.eventDate ?? "");
  const email = (body.email ?? "").trim();
  if (deliveryType === "evento") {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json(
        { error: "Para eventos necesitamos un correo válido." },
        { status: 400 }
      );
    }
    if (!eventDate || eventDate < todayUtc()) {
      return NextResponse.json(
        { error: "Elige una fecha de evento válida." },
        { status: 400 }
      );
    }
  }

  try {
    const productIds = [...new Set(items.map((i) => i.productId))];
    const [products, dbExtras, settings, promos] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: { in: productIds },
          OR: [
            { active: true },
            // Fuera de la carta pero dentro de una promo vigente: así se
            // venden las bebidas que solo existen como parte de un combo.
            { promos: { some: { active: true } } },
          ],
        },
        include: { category: { select: { slug: true } } },
      }),
      prisma.extra.findMany({ where: { active: true } }),
      getSettings(),
      getAutoPromos(),
    ]);

    const productById = new Map(products.map((p) => [p.id, p]));
    const extraByName = new Map(
      dbExtras.map((e) => [e.name.toLowerCase(), toNumber(e.price)])
    );

    const lines = [];
    const priceable: PriceableItem[] = [];

    for (const item of items) {
      const product = productById.get(item.productId);
      if (!product) continue;

      const quantity = Math.max(1, Math.min(50, Math.floor(item.quantity) || 1));

      const extras = (item.extras ?? [])
        .map((e) => ({
          name: e.name,
          price: extraByName.get(e.name.toLowerCase()) ?? 0,
        }))
        .filter((e) => extraByName.has(e.name.toLowerCase()));

      const extrasTotal = extras.reduce((s, e) => s + e.price, 0);
      const basePrice = toNumber(product.price);
      const unitPrice = basePrice + extrasTotal;
      const lineTotal = unitPrice * quantity;

      priceable.push({
        productId: product.id,
        basePrice,
        extrasTotal,
        quantity,
        categorySlug: product.category.slug,
        promoEligible: product.promoEligible,
      });

      lines.push({
        productId: product.id,
        name: product.name,
        unitPrice,
        quantity,
        extras: JSON.stringify(extras),
        lineTotal,
        extrasLabel: extras.map((e) => e.name).join(", "),
      });
    }

    if (lines.length === 0) {
      return NextResponse.json(
        { error: "Los productos de tu carrito ya no están disponibles." },
        { status: 400 }
      );
    }

    // Los combos que el cliente armó a propósito mandan sobre los
    // automáticos: priceCart deja una promo por categoría y se queda con la
    // primera de la lista.
    const elegidas = await getPromoRulesByIds(
      Array.isArray(body.promoIds) ? body.promoIds : []
    );

    const pricing = priceCart(priceable, [...elegidas, ...promos]);

    // ── Zona de envío: se recalcula acá, no se acepta la del navegador ──
    let deliveryZone: string | null = null;
    let deliveryFee = 0;

    if (deliveryType === "delivery") {
      // Ojo con null: Number(null) es 0, y (0,0) es un punto perfectamente
      // válido que caería siempre "fuera de zona" sin que nadie lo note
      const lat = body.lat == null ? NaN : Number(body.lat);
      const lng = body.lng == null ? NaN : Number(body.lng);

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        const zones = await getZones(settings.deliveryMapUrl);
        if (zones.length > 0) {
          deliveryZone = classify(lat, lng, zones).status;
          if (deliveryZone === "costo") {
            deliveryFee = toNumber(settings.deliveryFeePaid) || 0;
          }
        }
      }
    }

    const total = pricing.total + deliveryFee;
    const cur = settings.currency;
    const code = orderCode();

    // Un pedido para evento también entra a la bandeja de cotizaciones
    let eventRequestId: string | null = null;
    if (deliveryType === "evento" && eventDate) {
      const solicitud = await prisma.eventRequest.create({
        data: {
          code: eventCode(),
          name: customerName,
          email,
          phone,
          eventDate,
          eventType: (body.eventType ?? "").trim() || "Sin especificar",
          notes: `Pedido ${code} desde el carrito. ${(body.notes ?? "").trim()}`.trim(),
        },
      });
      eventRequestId = solicitud.id;
    }

    const order = await prisma.order.create({
      data: {
        code,
        customerName,
        phone,
        deliveryType,
        address: (body.address ?? "").trim() || null,
        lat: Number.isFinite(Number(body.lat)) ? Number(body.lat) : null,
        lng: Number.isFinite(Number(body.lng)) ? Number(body.lng) : null,
        scheduledFor: (body.scheduledFor ?? "").trim() || null,
        notes: (body.notes ?? "").trim() || null,
        docType,
        docNumber: docNumber || null,
        businessName: businessName || null,
        deliveryZone,
        deliveryFee,
        eventRequestId,
        subtotal: pricing.subtotal,
        total,
        items: {
          create: lines.map(({ extrasLabel: _e, ...line }) => line),
        },
      },
    });

    const message = [
      `¡Hola Roa Brew! 🧋 Quiero hacer un pedido.`,
      ``,
      `*Código:* ${code}`,
      `*Nombre:* ${customerName}`,
      `*Entrega:* ${DELIVERY_TEXT[deliveryType] ?? deliveryType}`,
      body.address?.trim() ? `*Dirección:* ${body.address.trim()}` : null,
      deliveryZone ? `*Zona:* ${ZONA_TEXT[deliveryZone]}` : null,
      body.scheduledFor?.trim() ? `*Para:* ${body.scheduledFor.trim()}` : null,
      deliveryType === "evento" && eventDate
        ? `*Fecha del evento:* ${eventDate.toISOString().slice(0, 10)}`
        : null,
      deliveryType === "evento" ? `*Tipo de evento:* ${body.eventType ?? ""}` : null,
      deliveryType === "evento" ? `*Correo:* ${email}` : null,
      ``,
      `*Comprobante:* ${DOC_TEXT[docType]}`,
      docType === "BOLETA_DNI" ? `*DNI:* ${docNumber}` : null,
      docType === "FACTURA" ? `*RUC:* ${docNumber}` : null,
      docType === "FACTURA" ? `*Razón social:* ${businessName}` : null,
      ``,
      `*Mi pedido:*`,
      ...lines.map(
        (l) =>
          `• ${l.quantity}x ${l.name}${l.extrasLabel ? ` (+ ${l.extrasLabel})` : ""} — ${cur} ${l.lineTotal.toFixed(2)}`
      ),
      ...(pricing.applied.length > 0
        ? [
            ``,
            `Subtotal: ${cur} ${pricing.subtotal.toFixed(2)}`,
            ...pricing.applied.map(
              (p) =>
                `Promo ${p.title} ${p.label}${p.bundles > 1 ? ` x${p.bundles}` : ""}: -${cur} ${p.saved.toFixed(2)}`
            ),
          ]
        : []),
      deliveryFee > 0 ? `Envío: ${cur} ${deliveryFee.toFixed(2)}` : null,
      ``,
      `*Total: ${cur} ${total.toFixed(2)}*`,
      body.notes?.trim() ? `` : null,
      body.notes?.trim() ? `*Notas:* ${body.notes.trim()}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    return NextResponse.json({
      code: order.code,
      total,
      discount: pricing.discount,
      deliveryFee,
      deliveryZone,
      message,
    });
  } catch (error) {
    console.error("[POST /api/orders]", error);
    return NextResponse.json(
      { error: "No pudimos registrar el pedido. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
