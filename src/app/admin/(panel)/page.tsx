import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { formatDate, money, toNumber, STATUS_LABELS } from "@/lib/format";
import { AdminHeader, EmptyState, LinkButton, Panel, StatCard } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  PENDIENTE: "bg-mango text-ink",
  CONFIRMADO: "bg-grape text-ink",
  PREPARANDO: "bg-roa-400 text-ink",
  ENTREGADO: "bg-roa-700 text-cream",
  CANCELADO: "bg-berry text-cream",
};

export default async function DashboardPage() {
  const settings = await getSettings();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [ordersToday, pending, monthOrders, activeProducts, recent, topItems] =
    await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.count({ where: { status: "PENDIENTE" } }),
      prisma.order.findMany({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELADO" } },
        select: { total: true },
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { items: true },
      }),
      prisma.orderItem.groupBy({
        by: ["name"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 6,
      }),
    ]);

  const monthTotal = monthOrders.reduce((s, o) => s + toNumber(o.total), 0);

  return (
    <>
      <AdminHeader
        kicker="panel interno"
        title="Resumen"
        action={<LinkButton href="/admin/pedidos">Ver todos los pedidos</LinkButton>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pedidos hoy" value={ordersToday} tone="mango" />
        <StatCard
          label="Pendientes"
          value={pending}
          tone={pending > 0 ? "grape" : "green"}
          hint={pending > 0 ? "Necesitan confirmación" : "Todo al día"}
        />
        <StatCard
          label="Ventas del mes"
          value={money(monthTotal, settings.currency)}
          tone="green"
          hint={`${monthOrders.length} pedidos`}
        />
        <StatCard label="Productos activos" value={activeProducts} tone="cream" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Últimos pedidos">
          {recent.length === 0 ? (
            <EmptyState
              title="Aún no hay pedidos"
              text="Cuando alguien pida desde la carta, aparecerá acá."
            />
          ) : (
            <ul className="divide-y divide-cream/8">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/pedidos#${order.code}`}
                    className="flex items-center gap-4 py-3.5 transition hover:opacity-80"
                  >
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        STATUS_TONE[order.status] ?? "bg-roa-700 text-cream"
                      }`}
                    >
                      {STATUS_LABELS[order.status]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-cream">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-cream/45">
                        {order.code} · {order.items.length} ítem(s) ·{" "}
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-display text-xl text-roa-300">
                      {money(order.total, settings.currency)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Lo más pedido">
          {topItems.length === 0 ? (
            <EmptyState title="Sin datos todavía" />
          ) : (
            <ol className="space-y-3">
              {topItems.map((item, i) => {
                const max = topItems[0]._sum.quantity ?? 1;
                const qty = item._sum.quantity ?? 0;
                return (
                  <li key={item.name}>
                    <div className="mb-1 flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-bold text-cream/85">
                        <span className="mr-1.5 text-roa-400">{i + 1}.</span>
                        {item.name}
                      </span>
                      <span className="shrink-0 font-display text-lg text-roa-300">
                        {qty}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-roa-950">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-roa-500 to-grape"
                        style={{ width: `${Math.max(6, (qty / max) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>
    </>
  );
}
