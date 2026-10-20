import { NextResponse } from "next/server";
import { resolverDescuento } from "@/lib/descuentoServidor";

export const dynamic = "force-dynamic";

/**
 * Valida un código mientras el cliente lo escribe en el carrito.
 *
 * Responde siempre 200, también cuando el código no sirve: el motivo va en
 * el cuerpo. Un 404 por un cupón mal tecleado ensucia los logs y obliga al
 * navegador a distinguir entre "no vale" y "se cayó la red", que son dos
 * cosas muy distintas para lo que hay que mostrarle al cliente.
 *
 * Esto no reserva ni consume nada: el uso se cuenta recién al registrar el
 * pedido.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body?.code ?? "");
    const items = Array.isArray(body?.items) ? body.items : [];

    // Un carrito de verdad no tiene cientos de líneas: el tope corta de raíz
    // una consulta enorme armada a mano
    if (items.length > 100) {
      return NextResponse.json({ ok: false, message: "Carrito demasiado grande." });
    }

    const r = await resolverDescuento(code, items);

    return NextResponse.json({
      ok: r.ok,
      code: r.code,
      amount: r.ok ? r.amount : 0,
      base: r.base,
      message: r.message,
    });
  } catch {
    return NextResponse.json(
      { ok: false, message: "No pudimos validar el código. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
