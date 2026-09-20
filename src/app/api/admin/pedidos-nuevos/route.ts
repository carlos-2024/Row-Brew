import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Último pedido registrado, para avisar en el panel cuando entra uno nuevo.
 *
 * Es lo más barato que respondía la pregunta: una sola fila y dos cuentas, sin
 * traer items ni totales. El panel la consulta cada pocos segundos y solo
 * compara el id con el que ya tenía.
 *
 * Se eligió consultar en vez de mantener una conexión abierta: son una o dos
 * personas mirando el panel desde el mostrador, y una consulta cada quince
 * segundos pesa menos que sostener un canal permanente.
 */
export async function GET() {
  // Misma puerta que el resto del panel: sin sesión no se responde nada
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [ultimo, pendientes] = await Promise.all([
      prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          code: true,
          customerName: true,
          deliveryType: true,
          createdAt: true,
        },
      }),
      prisma.order.count({ where: { status: "PENDIENTE" } }),
    ]);

    return NextResponse.json({
      pendientes,
      ultimo: ultimo
        ? {
            id: ultimo.id,
            code: ultimo.code,
            nombre: ultimo.customerName,
            tipo: ultimo.deliveryType,
          }
        : null,
    });
  } catch {
    // Un corte de base no debe romper la pantalla que el equipo tiene abierta
    return NextResponse.json({ pendientes: 0, ultimo: null });
  }
}
