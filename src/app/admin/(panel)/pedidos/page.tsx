import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  formatDate,
  money,
  DELIVERY_LABELS,
  STATUS_LABELS,
} from "@/lib/format";
import { updateOrderStatus, deleteOrder } from "@/app/admin/actions";
import {
  AdminHeader,
  Button,
  EmptyState,
  inputClass,
  Panel,
} from "@/components/admin/ui";
import { WhatsAppIcon } from "@/components/Icons";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = [
  "PENDIENTE",
  "CONFIRMADO",
  "PREPARANDO",
  "ENTREGADO",
  "CANCELADO",
];

const STATUS_TONE: Record<string, string> = {
  PENDIENTE: "bg-mango text-ink",
  CONFIRMADO: "bg-grape text-ink",
  PREPARANDO: "bg-roa-400 text-ink",
  ENTREGADO: "bg-roa-600 text-cream",
  CANCELADO: "bg-berry text-cream",
};

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const settings = await getSettings();

  const filter =
    estado && STATUSES.includes(estado as OrderStatus)
      ? (estado as OrderStatus)
      : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  const counts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countOf = (s: OrderStatus) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <>
      <AdminHeader kicker="operación" title="Pedidos" />

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
            !filter
              ? "border-ink bg-cream text-ink"
              : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
          }`}
        >
          Todos ({counts.reduce((s, c) => s + c._count._all, 0)})
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/pedidos?estado=${s}`}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
              filter === s
                ? `border-ink ${STATUS_TONE[s]}`
                : "border-cream/20 text-cream/60 hover:border-cream hover:text-cream"
            }`}
          >
            {STATUS_LABELS[s]} ({countOf(s)})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No hay pedidos aquí"
          text="Los pedidos hechos desde la carta aparecen en esta lista al instante."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {orders.map((order) => {
            const wa = `https://wa.me/${order.phone.replace(/\D/g, "")}`;
            return (
              <Panel key={order.id} className="scroll-mt-24">
                <div id={order.code} className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                      <span className="font-display text-xl text-cream">
                        {order.code}
                      </span>
                    </div>
                    <p className="mt-2 font-bold text-cream">{order.customerName}</p>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-roa-300 underline-offset-2 hover:underline"
                    >
                      <WhatsAppIcon className="h-4 w-4" /> {order.phone}
                    </a>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-3xl text-mango">
                      {money(order.total, settings.currency)}
                    </p>
                    <p className="text-xs text-cream/40">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 rounded-2xl bg-roa-950 p-4 text-sm">
                  {order.items.map((item) => {
                    const extras = JSON.parse(item.extras || "[]") as {
                      name: string;
                    }[];
                    return (
                      <li key={item.id} className="flex justify-between gap-3">
                        <span className="text-cream/80">
                          <span className="font-bold text-roa-300">
                            {item.quantity}×
                          </span>{" "}
                          {item.name}
                          {extras.length > 0 && (
                            <span className="text-cream/40">
                              {" "}
                              (+ {extras.map((e) => e.name).join(", ")})
                            </span>
                          )}
                        </span>
                        <span className="shrink-0 text-cream/60">
                          {money(item.lineTotal, settings.currency)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <dl className="mt-3 space-y-1 text-sm text-cream/55">
                  <div className="flex gap-2">
                    <dt className="font-bold text-cream/40">Entrega:</dt>
                    <dd>{DELIVERY_LABELS[order.deliveryType] ?? order.deliveryType}</dd>
                  </div>
                  {order.address && (
                    <div className="flex gap-2">
                      <dt className="font-bold text-cream/40">Dirección:</dt>
                      <dd>{order.address}</dd>
                    </div>
                  )}
                  {order.deliveryZone && (
                    <div className="flex gap-2">
                      <dt className="font-bold text-cream/40">Zona:</dt>
                      <dd
                        className={
                          order.deliveryZone === "gratis"
                            ? "text-mango"
                            : order.deliveryZone === "costo"
                              ? "text-grape"
                              : "text-berry"
                        }
                      >
                        {order.deliveryZone === "gratis"
                          ? "Envío gratis"
                          : order.deliveryZone === "costo"
                            ? `Envío ${money(order.deliveryFee, settings.currency)}`
                            : "Fuera de zona — coordinar con driver"}
                      </dd>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <dt className="font-bold text-cream/40">Comprobante:</dt>
                    <dd>
                      {order.docType === "FACTURA"
                        ? `Factura · RUC ${order.docNumber} · ${order.businessName}`
                        : order.docType === "BOLETA_DNI"
                          ? `Boleta con DNI ${order.docNumber}`
                          : "Boleta simple"}
                    </dd>
                  </div>
                  {order.scheduledFor && (
                    <div className="flex gap-2">
                      <dt className="font-bold text-cream/40">Para:</dt>
                      <dd>{order.scheduledFor}</dd>
                    </div>
                  )}
                  {order.notes && (
                    <div className="flex gap-2">
                      <dt className="font-bold text-cream/40">Notas:</dt>
                      <dd className="text-mango">{order.notes}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t-2 border-cream/8 pt-4">
                  <form action={updateOrderStatus} className="flex flex-1 gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select
                      name="status"
                      defaultValue={order.status}
                      className={`${inputClass} flex-1 py-2`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                    <Button variant="primary">Guardar</Button>
                  </form>

                  <form action={deleteOrder}>
                    <input type="hidden" name="id" value={order.id} />
                    <Button variant="danger">Eliminar</Button>
                  </form>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
