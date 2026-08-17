import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderCode, toNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { getAutoPromos } from "@/lib/menu";
import { priceCart, type PriceableItem } from "@/lib/pricing";

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
  scheduledFor?: string;
  notes?: string;
  items?: IncomingItem[];
};

const DELIVERY_TEXT: Record<string, string> = {
  recojo: "Recojo en el Pop Up",
  delivery: "Delivery",
  evento: "Evento / corporativo",
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
      { error: "Para delivery necesitamos la dirección." },
      { status: 400 }
    );
  }

  try {
    // Los precios SIEMPRE se recalculan aquí; nunca se confía en el cliente.
    const productIds = [...new Set(items.map((i) => i.productId))];
    const [products, dbExtras, settings, promos] = await Promise.all([
      prisma.product.findMany({
        where: { id: { in: productIds }, active: true },
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

    // Las promociones se calculan acá, con las reglas de la base. Lo que el
    // navegador haya mostrado es solo informativo.
    const pricing = priceCart(priceable, promos);
    const code = orderCode();

    const order = await prisma.order.create({
      data: {
        code,
        customerName,
        phone,
        deliveryType,
        address: (body.address ?? "").trim() || null,
        scheduledFor: (body.scheduledFor ?? "").trim() || null,
        notes: (body.notes ?? "").trim() || null,
        subtotal: pricing.subtotal,
        total: pricing.total,
        items: {
          create: lines.map(({ extrasLabel: _extrasLabel, ...line }) => line),
        },
      },
    });

    // Mensaje listo para pegar en WhatsApp
    const cur = settings.currency;
    const message = [
      `¡Hola Roa Brew! 🧋 Quiero hacer un pedido.`,
      ``,
      `*Código:* ${code}`,
      `*Nombre:* ${customerName}`,
      `*Entrega:* ${DELIVERY_TEXT[deliveryType] ?? deliveryType}`,
      body.address?.trim() ? `*Dirección:* ${body.address.trim()}` : null,
      body.scheduledFor?.trim() ? `*Para:* ${body.scheduledFor.trim()}` : null,
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
      ``,
      `*Total: ${cur} ${pricing.total.toFixed(2)}*`,
      body.notes?.trim() ? `` : null,
      body.notes?.trim() ? `*Notas:* ${body.notes.trim()}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    return NextResponse.json({
      code: order.code,
      total: pricing.total,
      discount: pricing.discount,
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
